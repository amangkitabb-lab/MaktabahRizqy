"""Maktabahrizqy - private, owner-only reading library backed by Google Drive.

Design: Google OAuth + owner email allowlist; SQLite for metadata/progress; Drive remains
source of PDFs. Existing Drive files are never moved, renamed, shared, or deleted.
"""

from __future__ import annotations

import hashlib
import os
import secrets
import sqlite3
import tempfile
import threading
import time
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal
from urllib.parse import urlencode, urlparse

import fitz
import httpx
from cryptography.fernet import Fernet
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator

BASE = Path(__file__).resolve().parent


def load_dotenv():
    path = BASE / '.env'
    if not path.exists():
        return
    for raw in path.read_text(encoding='utf-8').splitlines():
        stripped = raw.strip()
        if not stripped or stripped.startswith('#') or '=' not in stripped:
            continue
        k, v = stripped.split('=', 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


load_dotenv()
OWNER_EMAIL = os.getenv('OWNER_EMAIL', '').strip().lower()
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '').strip()
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', '').strip()
BASE_URL = os.getenv('APP_BASE_URL', 'http://localhost:8000').rstrip('/')
FOLDER_ID = os.getenv('DRIVE_FOLDER_ID', '').strip()
TOKEN_KEY = os.getenv('TOKEN_ENCRYPTION_KEY', '').strip()
COOKIE_SECURE = os.getenv('COOKIE_SECURE', 'false').lower() == 'true'
DATA_DIR = Path(os.getenv('DATA_DIR', './data'))
if not DATA_DIR.is_absolute():
    DATA_DIR = BASE / DATA_DIR
DATA_DIR.mkdir(parents=True, exist_ok=True, mode=0o700)
CACHE_DIR = DATA_DIR / 'pdf_cache'
CACHE_DIR.mkdir(parents=True, exist_ok=True, mode=0o700)
DB_PATH = DATA_DIR / 'maktabahrizqy.sqlite3'

app = FastAPI(title='Maktabahrizqy', docs_url=None, redoc_url=None, openapi_url=None)
app.mount('/static', StaticFiles(directory=BASE / 'static'), name='static')
_access_cache: dict[str, tuple[str, float]] = {}
_access_lock = threading.Lock()


@contextmanager
def db():
    con = sqlite3.connect(DB_PATH, timeout=20)
    con.row_factory = sqlite3.Row
    con.execute('PRAGMA foreign_keys=ON')
    try:
        yield con
        con.commit()
    except Exception:
        con.rollback()
        raise
    finally:
        con.close()


def init_db():
    with db() as con:
        con.executescript('''
          CREATE TABLE IF NOT EXISTS sessions (
            sid_hash TEXT PRIMARY KEY, email TEXT NOT NULL,
            csrf TEXT NOT NULL, expires INTEGER NOT NULL
          );
          CREATE TABLE IF NOT EXISTS google_tokens (
            email TEXT PRIMARY KEY, encrypted_refresh TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS books (
            id TEXT PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL DEFAULT '',
            kind TEXT NOT NULL CHECK(kind IN ('kitab','buku')),
            fann TEXT NOT NULL DEFAULT 'Belum Diklasifikasikan',
            pdf_url TEXT NOT NULL DEFAULT '', cover_url TEXT NOT NULL DEFAULT '',
            drive_file_id TEXT UNIQUE,
            notes TEXT NOT NULL DEFAULT '', total_pages INTEGER NOT NULL DEFAULT 0,
            current_page INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'belum' CHECK(status IN ('belum','sedang','selesai')),
            created_at TEXT NOT NULL, updated_at TEXT NOT NULL, last_read_at TEXT
          );
          CREATE INDEX IF NOT EXISTS books_updated_idx ON books(updated_at DESC);
          CREATE INDEX IF NOT EXISTS books_kind_fann_idx ON books(kind, fann);
        ''')


init_db()


def now_iso():
    return datetime.now(timezone.utc).isoformat(timespec='seconds')


def configured():
    return bool(OWNER_EMAIL and GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET and FOLDER_ID and TOKEN_KEY)


def encrypt_token(refresh: str):
    try:
        return Fernet(TOKEN_KEY.encode('utf-8')).encrypt(refresh.encode('utf-8')).decode('utf-8')
    except (ValueError, Exception) as exc:
        raise HTTPException(503, 'TOKEN_ENCRYPTION_KEY tidak valid.') from exc


def decrypt_token(value: str):
    try:
        return Fernet(TOKEN_KEY.encode('utf-8')).decrypt(value.encode('utf-8')).decode('utf-8')
    except Exception as exc:
        raise HTTPException(503, 'Token Google tidak bisa dibuka; periksa kunci enkripsi server.') from exc


def authenticated(request: Request):
    raw = request.cookies.get('maktabah_sid', '')
    if not raw:
        raise HTTPException(401, 'Silakan masuk terlebih dahulu.')
    h = hashlib.sha256(raw.encode()).hexdigest()
    with db() as con:
        s = con.execute('SELECT email, csrf, expires FROM sessions WHERE sid_hash=?', (h,)).fetchone()
    if not s or s['expires'] < time.time() or s['email'] != OWNER_EMAIL:
        raise HTTPException(401, 'Sesi berakhir. Silakan masuk lagi.')
    return {'email': s['email'], 'csrf': s['csrf']}


def check_write(request: Request):
    s = authenticated(request)
    submitted = request.headers.get('x-csrf-token', '')
    if not submitted or not secrets.compare_digest(submitted, s['csrf']):
        raise HTTPException(403, 'Token keamanan tidak cocok. Muat ulang halaman.')
    return s


def make_session(email: str):
    sid = secrets.token_urlsafe(40)
    csrf = secrets.token_urlsafe(36)
    with db() as con:
        con.execute('DELETE FROM sessions WHERE expires < ?', (int(time.time()),))
        con.execute('INSERT INTO sessions (sid_hash,email,csrf,expires) VALUES (?,?,?,?)',
                    (hashlib.sha256(sid.encode()).hexdigest(), email, csrf, int(time.time()) + 30 * 86400))
    return sid


@app.middleware('http')
async def security_headers(request: Request, call_next):
    resp = await call_next(request)
    resp.headers['X-Content-Type-Options'] = 'nosniff'
    resp.headers['Referrer-Policy'] = 'no-referrer'
    resp.headers['X-Frame-Options'] = 'DENY'
    resp.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
    resp.headers['Cache-Control'] = 'private, no-store'
    if COOKIE_SECURE:
        resp.headers['Strict-Transport-Security'] = 'max-age=15552000'
    resp.headers['Content-Security-Policy'] = ("default-src 'self'; "
        "script-src 'self'; style-src 'self'; img-src 'self' https: data:; "
        "connect-src 'self'; font-src 'self'; object-src 'none'; "
        "base-uri 'self'; frame-ancestors 'none'; form-action 'self'")
    return resp


@app.get('/', include_in_schema=False)
def index():
    return FileResponse(BASE / 'static/index.html')


@app.get('/kebijakan-privasi', include_in_schema=False)
def privacy():
    # Halaman ini publik supaya pengguna dapat membaca penjelasan sebelum OAuth.
    return FileResponse(BASE / 'static/privacy.html')


@app.get('/api/me')
def me(request: Request):
    if not configured():
        return {'authenticated': False, 'configured': False}
    try:
        u = authenticated(request)
    except HTTPException:
        return {'authenticated': False, 'configured': True}
    return {'authenticated': True, 'configured': True, 'email': u['email'], 'csrf': u['csrf']}


@app.get('/auth/login')
def login():
    if not configured():
        return HTMLResponse('<h2>Konfigurasi Google OAuth belum lengkap. Baca README.md.</h2>', status_code=503)
    state = secrets.token_urlsafe(32)
    params = {
        'client_id': GOOGLE_CLIENT_ID,
        'redirect_uri': f'{BASE_URL}/auth/callback',
        'response_type': 'code',
        'scope': 'openid email profile https://www.googleapis.com/auth/drive.readonly',
        'access_type': 'offline', 'prompt': 'consent', 'state': state,
    }
    resp = RedirectResponse('https://accounts.google.com/o/oauth2/v2/auth?' + urlencode(params), status_code=302)
    resp.set_cookie('maktabah_oauth_state', state, httponly=True, secure=COOKIE_SECURE,
                    samesite='lax', max_age=600, path='/auth')
    return resp


@app.get('/auth/callback')
async def callback(request: Request):
    passed_state = request.query_params.get('state', '')
    saved_state = request.cookies.get('maktabah_oauth_state', '')
    code = request.query_params.get('code', '')
    if not saved_state or not passed_state or not secrets.compare_digest(passed_state, saved_state) or not code:
        raise HTTPException(400, 'Permintaan login tidak valid atau kedaluwarsa.')
    async with httpx.AsyncClient(timeout=20) as client:
        tk = await client.post('https://oauth2.googleapis.com/token', data={
            'code': code, 'client_id': GOOGLE_CLIENT_ID, 'client_secret': GOOGLE_CLIENT_SECRET,
            'redirect_uri': f'{BASE_URL}/auth/callback', 'grant_type': 'authorization_code'
        })
        if tk.status_code != 200:
            raise HTTPException(401, 'Google tidak memberikan akses. Ulangi login.')
        payload = tk.json()
        user_resp = await client.get('https://openidconnect.googleapis.com/v1/userinfo',
                                     headers={'Authorization': f"Bearer {payload['access_token']}"})
        if user_resp.status_code != 200:
            raise HTTPException(401, 'Profil Google tidak dapat diverifikasi.')
        profile = user_resp.json()
    email = profile.get('email', '').strip().lower()
    if not profile.get('email_verified') or email != OWNER_EMAIL:
        raise HTTPException(403, 'Akun ini tidak termasuk pemilik Maktabahrizqy.')
    refresh = payload.get('refresh_token', '')
    if refresh:
        with db() as con:
            con.execute('INSERT INTO google_tokens (email,encrypted_refresh) VALUES (?,?) '
                        'ON CONFLICT(email) DO UPDATE SET encrypted_refresh=excluded.encrypted_refresh',
                        (email, encrypt_token(refresh)))
    else:
        with db() as con:
            existing = con.execute('SELECT 1 FROM google_tokens WHERE email=?', (email,)).fetchone()
        if not existing:
            raise HTTPException(400, 'Google tidak mengirim refresh token; cabut izin lalu login lagi.')
    with _access_lock:
        _access_cache[email] = (payload['access_token'], time.time() + int(payload.get('expires_in', 3600)) - 60)
    sid = make_session(email)
    resp = RedirectResponse('/', status_code=302)
    resp.delete_cookie('maktabah_oauth_state', path='/auth')
    resp.set_cookie('maktabah_sid', sid, httponly=True, secure=COOKIE_SECURE,
                    samesite='lax', max_age=30 * 86400, path='/')
    return resp


@app.post('/api/logout')
def logout(request: Request):
    check_write(request)
    raw = request.cookies.get('maktabah_sid', '')
    with db() as con:
        con.execute('DELETE FROM sessions WHERE sid_hash=?', (hashlib.sha256(raw.encode()).hexdigest(),))
    resp = JSONResponse({'ok': True})
    resp.delete_cookie('maktabah_sid', path='/')
    return resp


def drive_token(email: str):
    with _access_lock:
        cached = _access_cache.get(email)
        if cached and cached[1] > time.time():
            return cached[0]
    with db() as con:
        row = con.execute('SELECT encrypted_refresh FROM google_tokens WHERE email=?', (email,)).fetchone()
    if not row:
        raise HTTPException(401, 'Login Google perlu diperbarui.')
    refresh = decrypt_token(row['encrypted_refresh'])
    try:
        t = httpx.post('https://oauth2.googleapis.com/token', data={
            'client_id': GOOGLE_CLIENT_ID, 'client_secret': GOOGLE_CLIENT_SECRET,
            'refresh_token': refresh, 'grant_type': 'refresh_token'
        }, timeout=25)
        t.raise_for_status()
        p = t.json()
        token = p['access_token']
    except (httpx.HTTPStatusError, KeyError, ValueError) as exc:
        if isinstance(exc, httpx.HTTPStatusError) and exc.response.status_code in (400, 401):
            # Pada mode Testing, refresh token Drive sering berakhir dalam 7 hari.
            # Metadata dan progres di database tidak dihapus saat otorisasi perlu diperbarui.
            with _access_lock:
                _access_cache.pop(email, None)
            raise HTTPException(401, 'Izin Google Drive perlu diperbarui. Buka /auth/login untuk menyambungkan ulang.') from exc
        raise HTTPException(502, 'Akses Google Drive tidak tersedia. Coba login kembali.') from exc
    except httpx.HTTPError as exc:
        raise HTTPException(502, 'Koneksi ke Google Drive gagal. Coba lagi.') from exc
    with _access_lock:
        _access_cache[email] = (token, time.time() + int(p.get('expires_in', 3600)) - 60)
    return token


def drive_list(email: str):
    """List PDFs recursively within the dedicated folder, never elsewhere."""
    token = drive_token(email)
    pdfs = []
    pending = [(FOLDER_ID, ())]
    visited = set()
    while pending:
        folder, path_parts = pending.pop(0)
        if folder in visited:
            continue
        visited.add(folder)
        if len(visited) > 300:
            raise HTTPException(422, 'Terlalu banyak subfolder untuk sinkronisasi otomatis.')
        page = None
        while True:
            params = {
                'q': f"'{folder}' in parents and trashed = false",
                'fields': 'nextPageToken,files(id,name,mimeType,size,webViewLink)',
                'pageSize': 1000,
            }
            if page:
                params['pageToken'] = page
            try:
                r = httpx.get('https://www.googleapis.com/drive/v3/files',
                              params=params, headers={'Authorization': f'Bearer {token}'}, timeout=35)
                r.raise_for_status()
            except httpx.HTTPError as exc:
                raise HTTPException(502, 'Gagal membaca folder Maktabahrizqy di Google Drive.') from exc
            result = r.json()
            for f in result.get('files', []):
                if f.get('mimeType') == 'application/vnd.google-apps.folder':
                    pending.append((f['id'], (*path_parts, f.get('name', ''))))
                elif f.get('mimeType') == 'application/pdf':
                    f['folder_path'] = '/'.join(path_parts)
                    pdfs.append(f)
            page = result.get('nextPageToken')
            if not page:
                break
    return pdfs


def safe_url(value: str):
    if not value:
        return ''
    u = urlparse(value.strip())
    if u.scheme not in ('http', 'https') or not u.netloc or u.username or u.password:
        raise ValueError('Tautan harus berupa URL http/https yang valid.')
    return value.strip()


class BookInput(BaseModel):
    title: str = Field(min_length=1, max_length=260)
    author: str = Field(default='', max_length=200)
    kind: Literal['kitab', 'buku'] = 'kitab'
    fann: str = Field(default='Belum Diklasifikasikan', max_length=100)
    pdf_url: str = Field(default='', max_length=1500)
    cover_url: str = Field(default='', max_length=1500)
    notes: str = Field(default='', max_length=4000)
    total_pages: int = Field(default=0, ge=0, le=100000)

    @field_validator('pdf_url', 'cover_url')
    @classmethod
    def validate_url(cls, value: str):
        return safe_url(value)


class BookPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=260)
    author: str | None = Field(default=None, max_length=200)
    kind: Literal['kitab', 'buku'] | None = None
    fann: str | None = Field(default=None, max_length=100)
    pdf_url: str | None = Field(default=None, max_length=1500)
    cover_url: str | None = Field(default=None, max_length=1500)
    notes: str | None = Field(default=None, max_length=4000)
    total_pages: int | None = Field(default=None, ge=0, le=100000)
    status: Literal['belum', 'sedang', 'selesai'] | None = None

    @field_validator('pdf_url', 'cover_url')
    @classmethod
    def validate_url(cls, value: str | None):
        return safe_url(value) if value is not None else None


class ProgressInput(BaseModel):
    page: int = Field(ge=0, le=100000)
    source: Literal['manual', 'auto'] = 'manual'


def book_dict(row):
    return dict(row)


def get_book(book_id: str):
    with db() as con:
        row = con.execute('SELECT * FROM books WHERE id=?', (book_id,)).fetchone()
    if not row:
        raise HTTPException(404, 'Bacaan tidak ditemukan.')
    return book_dict(row)


@app.get('/api/books')
def books(request: Request):
    authenticated(request)
    with db() as con:
        rows = con.execute('SELECT * FROM books ORDER BY updated_at DESC, title COLLATE NOCASE').fetchall()
    return {'books': [book_dict(r) for r in rows]}


@app.post('/api/books')
def create_book(request: Request, payload: BookInput):
    check_write(request)
    now = now_iso()
    book_id = str(uuid.uuid4())
    with db() as con:
        con.execute('''INSERT INTO books (id,title,author,kind,fann,pdf_url,cover_url,notes,total_pages,
            created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)''',
            (book_id, payload.title.strip(), payload.author.strip(), payload.kind, payload.fann.strip(),
             payload.pdf_url, payload.cover_url, payload.notes, payload.total_pages, now, now))
    return {'book': get_book(book_id)}


@app.patch('/api/books/{book_id}')
def patch_book(request: Request, book_id: str, payload: BookPatch):
    check_write(request)
    existing = get_book(book_id)
    fields = payload.model_dump(exclude_unset=True)
    if not fields:
        return {'book': existing}
    allowed = set(BookPatch.model_fields)
    if any(k not in allowed for k in fields):
        raise HTTPException(400, 'Kolom tidak dikenal.')
    if 'title' in fields:
        fields['title'] = fields['title'].strip()
    if 'fann' in fields:
        fields['fann'] = fields['fann'].strip() or 'Belum Diklasifikasikan'
    if 'status' in fields and fields['status'] == 'selesai' and existing['total_pages']:
        fields['current_page'] = existing['total_pages']
    fields['updated_at'] = now_iso()
    query = 'UPDATE books SET ' + ', '.join(f'{k}=?' for k in fields) + ' WHERE id=?'
    with db() as con:
        con.execute(query, (*fields.values(), book_id))
    return {'book': get_book(book_id)}


@app.post('/api/books/{book_id}/progress')
def progress(request: Request, book_id: str, payload: ProgressInput):
    check_write(request)
    b = get_book(book_id)
    page = payload.page
    if b['total_pages'] and page > b['total_pages']:
        raise HTTPException(422, 'Nomor halaman melebihi jumlah halaman PDF.')
    # Automatic reading should never erase progress when revisiting earlier pages.
    # Manual input intentionally allows the owner to correct or reset a position.
    if payload.source == 'auto':
        page = max(page, b['current_page'])
    status = 'belum' if page == 0 else ('selesai' if b['total_pages'] and page >= b['total_pages'] else 'sedang')
    if payload.source == 'auto' and b['status'] == 'selesai':
        status = 'selesai'
    now = now_iso()
    with db() as con:
        con.execute('''UPDATE books SET current_page=?,status=?,last_read_at=?,updated_at=? WHERE id=?''',
                    (page, status, now if page else None, now, book_id))
    return {'book': get_book(book_id)}


@app.delete('/api/books/{book_id}')
def delete_book(request: Request, book_id: str):
    check_write(request)
    get_book(book_id)
    with db() as con:
        con.execute('DELETE FROM books WHERE id=?', (book_id,))
    return {'ok': True, 'message': 'Hanya catatan katalog dihapus; PDF di Drive tidak disentuh.'}


@app.get('/api/drive/candidates')
def candidates(request: Request):
    u = authenticated(request)
    return {'files': drive_list(u['email']), 'folder_id': FOLDER_ID}


@app.post('/api/drive/sync')
def sync(request: Request):
    u = check_write(request)
    files = drive_list(u['email'])
    created = 0
    timestamp = now_iso()
    with db() as con:
        for f in files:
            fid = f.get('id', '')
            if not fid:
                continue
            exists = con.execute('SELECT id FROM books WHERE drive_file_id=?', (fid,)).fetchone()
            if exists:
                continue
            raw = f.get('name') or 'Tanpa judul'
            title = raw[:-4] if raw.lower().endswith('.pdf') else raw
            parts = [p.strip() for p in f.get('folder_path', '').split('/') if p.strip()]
            book_kind = 'buku' if any(p.lower() in ('buku', 'buku bacaan') for p in parts) else 'kitab'
            fann = ('Buku Bacaan' if book_kind == 'buku' else
                    next((p for p in reversed(parts) if p not in ('Kitab', 'Fann')), 'Belum Diklasifikasikan'))
            con.execute('''INSERT INTO books (id,title,author,kind,fann,drive_file_id,
                created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)''',
                (str(uuid.uuid4()), title.strip(), '', book_kind, fann,
                 fid, timestamp, timestamp))
            created += 1
    return {'ok': True, 'created': created, 'scanned': len(files),
            'message': 'Hanya katalog yang diperbarui, tanpa memindahkan/rename file Drive.'}


def ensure_pdf(book: dict, email: str):
    if not book['drive_file_id']:
        raise HTTPException(400, 'Pembaca internal hanya mendukung PDF yang diimpor dari folder Drive.')
    fid = book['drive_file_id']
    name = hashlib.sha256(fid.encode()).hexdigest() + '.pdf'
    path = CACHE_DIR / name
    if path.exists() and path.stat().st_size > 4:
        return path
    token = drive_token(email)
    url = f'https://www.googleapis.com/drive/v3/files/{fid}'
    tmp_name = None
    try:
        with httpx.Client(timeout=httpx.Timeout(120, connect=20)) as client:
            with client.stream('GET', url, params={'alt': 'media'},
                               headers={'Authorization': f'Bearer {token}'}) as r:
                r.raise_for_status()
                with tempfile.NamedTemporaryFile('wb', dir=CACHE_DIR, prefix='tmp_', delete=False) as tmp:
                    tmp_name = tmp.name
                    os.chmod(tmp_name, 0o600)
                    length = 0
                    for chunk in r.iter_bytes(1024 * 1024):
                        length += len(chunk)
                        if length > 250 * 1024 * 1024:
                            raise HTTPException(413, 'PDF lebih dari 250 MB; perlu mode pembaca khusus.')
                        tmp.write(chunk)
        if not tmp_name or not Path(tmp_name).exists() or Path(tmp_name).stat().st_size < 5:
            raise HTTPException(502, 'PDF belum dapat diunduh dari Drive.')
        with fitz.open(tmp_name) as probe:
            if probe.page_count < 1:
                raise HTTPException(422, 'PDF tidak berisi halaman.')
        os.replace(tmp_name, path)
        return path
    except HTTPException:
        raise
    except (httpx.HTTPError, RuntimeError, ValueError) as exc:
        raise HTTPException(502, 'PDF gagal dibaca. Pastikan berkas Drive dapat diakses.') from exc
    finally:
        if tmp_name and Path(tmp_name).exists():
            Path(tmp_name).unlink(missing_ok=True)


def pdf_info(book, email):
    path = ensure_pdf(book, email)
    try:
        with fitz.open(path) as doc:
            pages = doc.page_count
    except Exception as exc:
        raise HTTPException(422, 'PDF rusak, terkunci, atau tidak bisa dibuka.') from exc
    if pages != book['total_pages']:
        now = now_iso()
        with db() as con:
            con.execute('UPDATE books SET total_pages=?,updated_at=? WHERE id=?', (pages, now, book['id']))
    return path, pages


@app.get('/api/books/{book_id}/info')
def reader_info(request: Request, book_id: str):
    u = authenticated(request)
    b = get_book(book_id)
    _, pages = pdf_info(b, u['email'])
    return {'pages': pages, 'title': b['title'], 'current_page': b['current_page'], 'can_auto_track': True}


def jpeg_page(path: Path, page_index: int, scale: float):
    try:
        with fitz.open(path) as doc:
            page = doc.load_page(page_index)
            pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
            return pix.tobytes('jpeg', jpg_quality=81)
    except (RuntimeError, ValueError, IndexError) as exc:
        raise HTTPException(422, 'Halaman PDF tidak dapat dirender.') from exc


@app.get('/api/books/{book_id}/pages/{page_num}')
def reader_page(request: Request, book_id: str, page_num: int):
    u = authenticated(request)
    b = get_book(book_id)
    path, pages = pdf_info(b, u['email'])
    if page_num < 1 or page_num > pages:
        raise HTTPException(404, 'Halaman tidak ditemukan.')
    jpg = jpeg_page(path, page_num - 1, scale=1.55)
    return Response(content=jpg, media_type='image/jpeg')


@app.get('/api/books/{book_id}/cover')
def cover(request: Request, book_id: str):
    u = authenticated(request)
    b = get_book(book_id)
    if not b['drive_file_id']:
        raise HTTPException(404, 'Bacaan ini belum mempunyai sampul PDF.')
    cached_cover = CACHE_DIR / (hashlib.sha256(b['drive_file_id'].encode()).hexdigest() + '.jpg')
    if cached_cover.exists():
        return FileResponse(cached_cover, media_type='image/jpeg')
    path = ensure_pdf(b, u['email'])
    jpg = jpeg_page(path, 0, scale=0.95)
    cached_cover.write_bytes(jpg)
    os.chmod(cached_cover, 0o600)
    return Response(content=jpg, media_type='image/jpeg')


@app.get('/health')
def health():
    # Only non-sensitive operational status; the DB and Google tokens are never exposed.
    return {'ok': True}
