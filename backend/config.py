import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Адреса фронта и бэка
    FRONTEND_DOMAIN = "http://192.168.2.101:3000"
    BACKEND_DOMAIN = "http://192.168.2.101:5000"

    # SQLite
    SQLALCHEMY_DATABASE_URI = "sqlite:///./app.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Путь до GeoIP базы
    GEOIP_DB_PATH = "./data/GeoLite2-Country.mmdb"
