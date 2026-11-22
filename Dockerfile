FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Salin hanya kode publik, tidak pernah .env, token, PDF, atau database.
COPY app.py /app/app.py
COPY static/ /app/static/

EXPOSE 8000
# Railway menyetel PORT secara dinamis; lokal memakai 8000.
CMD ["sh", "-c", "exec uvicorn app:app --host 0.0.0.0 --port \"${PORT:-8000}\""]
