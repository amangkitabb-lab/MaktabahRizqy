"""Buat kunci Fernet secara LOKAL. Jangan kirim hasilnya ke chat."""
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode('ascii'))
