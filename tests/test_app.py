import hashlib
import importlib
import sys
import time
from pathlib import Path

import fitz
import pytest
from cryptography.fernet import Fernet
from fastapi.testclient import TestClient


@pytest.fixture
def setup(tmp_path, monkeypatch):
    monkeypatch.setenv('OWNER_EMAIL', 'owner@example.test')
    monkeypatch.setenv('GOOGLE_CLIENT_ID', 'local-test-client')
    monkeypatch.setenv('GOOGLE_CLIENT_SECRET', 'local-test-secret')
    monkeypatch.setenv('DRIVE_FOLDER_ID', 'fake-folder-id')
    monkeypatch.setenv('TOKEN_ENCRYPTION_KEY', Fernet.generate_key().decode('utf8'))
    monkeypatch.setenv('DATA_DIR', str(tmp_path / 'data'))
    monkeypatch.setenv('COOKIE_SECURE', 'false')
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    import app as mod
    mod = importlib.reload(mod)
    client = TestClient(mod.app)
    return mod, client


def login(mod, client):
    sid = 'test-session-not-real'
    csrf = 'test-csrf-token'
    with mod.db() as con:
        con.execute('INSERT INTO sessions (sid_hash,email,csrf,expires) VALUES (?,?,?,?)',
                    (hashlib.sha256(sid.encode()).hexdigest(), 'owner@example.test', csrf,
                     int(time.time()) + 3600))
    client.cookies.set('maktabah_sid', sid)
    return {'X-CSRF-Token': csrf}


def test_private_endpoint_blocks_unauthenticated(setup):
    mod, client = setup
    assert client.get('/health').json()['ok']
    assert client.get('/api/books').status_code == 401
    assert client.post('/api/drive/sync').status_code == 401
    assert client.get('/api/me').json()['authenticated'] is False
    # Users cannot get protected PDFs without being logged in.
    assert client.get('/api/books/anything/cover').status_code == 401


def test_book_crud_and_manual_progress(setup):
    mod, client = setup
    csrf = login(mod, client)
    assert client.get('/api/me').json()['authenticated'] is True
    sample = {
        'title': 'Contoh Kitab', 'author': 'Pengarang Contoh', 'kind': 'kitab',
        'fann': 'Fiqh', 'total_pages': 100, 'pdf_url': '', 'cover_url': '', 'notes': ''
    }
    assert client.post('/api/books', json=sample).status_code == 403
    r = client.post('/api/books', headers=csrf, json=sample)
    assert r.status_code == 200, r.text
    bid = r.json()['book']['id']
    assert len(client.get('/api/books').json()['books']) == 1
    prog = client.post(f'/api/books/{bid}/progress', headers=csrf, json={'page': 37})
    assert prog.status_code == 200
    assert prog.json()['book']['status'] == 'sedang'
    assert prog.json()['book']['current_page'] == 37
    bad = client.post(f'/api/books/{bid}/progress', headers=csrf, json={'page': 101})
    assert bad.status_code == 422
    done = client.post(f'/api/books/{bid}/progress', headers=csrf, json={'page': 100})
    assert done.json()['book']['status'] == 'selesai'
    revisit = client.post(f'/api/books/{bid}/progress', headers=csrf, json={'page': 4, 'source': 'auto'})
    assert revisit.json()['book']['current_page'] == 100
    assert revisit.json()['book']['status'] == 'selesai'
    renamed = client.patch(f'/api/books/{bid}', headers=csrf, json={'title': 'Contoh Kitab Baru'})
    assert renamed.json()['book']['title'] == 'Contoh Kitab Baru'
    assert client.delete(f'/api/books/{bid}', headers=csrf).status_code == 200
    assert client.get('/api/books').json()['books'] == []


def test_sync_only_adds_catalog_data_and_classifies_folders(setup, monkeypatch):
    mod, client = setup
    csrf = login(mod, client)
    fake = [
        {'id': 'fid-1', 'name': 'Fiqh dari Drive.pdf', 'mimeType': 'application/pdf', 'folder_path': 'Kitab/Fiqh'},
        {'id': 'fid-2', 'name': 'Novel contoh.pdf', 'mimeType': 'application/pdf', 'folder_path': 'Buku Bacaan'},
    ]
    monkeypatch.setattr(mod, 'drive_list', lambda email: fake)
    first = client.post('/api/drive/sync', headers=csrf).json()
    assert first['created'] == 2 and first['scanned'] == 2
    second = client.post('/api/drive/sync', headers=csrf).json()
    assert second['created'] == 0
    rows = client.get('/api/books').json()['books']
    assert len(rows) == 2
    assert next(x for x in rows if x['title'] == 'Fiqh dari Drive')['fann'] == 'Fiqh'
    assert next(x for x in rows if x['title'] == 'Novel contoh')['kind'] == 'buku'


def test_reader_renders_private_pdf_and_saves_page_count(setup, monkeypatch, tmp_path):
    mod, client = setup
    csrf = login(mod, client)
    pdf_path = tmp_path / 'mock.pdf'
    pdf = fitz.open()
    pdf.new_page(width=595, height=842).insert_text((100, 120), 'Halaman Satu')
    pdf.new_page(width=595, height=842).insert_text((100, 120), 'Halaman Dua')
    pdf.save(pdf_path)
    pdf.close()
    with mod.db() as con:
        con.execute('''INSERT INTO books (id,title,author,kind,fann,drive_file_id,created_at,updated_at)
                       VALUES (?,?,?,?,?,?,?,?)''',
                    ('book-test', 'Buku Tes', '', 'kitab', 'Fiqh', 'id-google-palsu', mod.now_iso(), mod.now_iso()))
    monkeypatch.setattr(mod, 'ensure_pdf', lambda book, email: pdf_path)
    res = client.get('/api/books/book-test/info')
    assert res.status_code == 200 and res.json()['pages'] == 2
    jpg = client.get('/api/books/book-test/pages/2')
    assert jpg.status_code == 200, jpg.text[:200]
    assert jpg.headers['content-type'].startswith('image/jpeg')
    assert jpg.content.startswith(b'\xff\xd8')
    saved = client.post('/api/books/book-test/progress', json={'page': 2}, headers=csrf)
    assert saved.json()['book']['status'] == 'selesai'
    assert saved.json()['book']['total_pages'] == 2


def test_login_state_and_required_scopes(setup):
    mod, client = setup
    response = client.get('/auth/login', follow_redirects=False)
    assert response.status_code == 302
    location = response.headers['location']
    assert location.startswith('https://accounts.google.com/o/oauth2/v2/auth?')
    from urllib.parse import parse_qs, urlparse
    params = parse_qs(urlparse(location).query)
    assert params['redirect_uri'] == ['http://localhost:8000/auth/callback']
    assert 'https://www.googleapis.com/auth/drive.readonly' in params['scope'][0]
    assert 'openid' in params['scope'][0]
    assert params['state'][0]
    assert 'maktabah_oauth_state' in response.headers['set-cookie']
    # Perubahan status login hanya bisa selesai bila callback state cocok.
    assert client.get('/auth/callback?code=test&state=wrong').status_code == 400


def test_privacy_page_is_public_without_exposing_books(setup):
    mod, client = setup
    page = client.get('/kebijakan-privasi')
    assert page.status_code == 200
    assert 'Kebijakan Privasi' in page.text
    assert 'Drive hanya baca' in page.text
    assert client.get('/api/books').status_code == 401
