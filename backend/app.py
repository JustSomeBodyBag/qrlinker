from flask import Flask, request
from config import Config
from extensions import db
from routes import main
import logging
import os
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ProxyFix для правильного определения IP за прокси
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1)

    # Включаем CORS для всех маршрутов и указанных фронтенд-доменов
    CORS(app, origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.2.101:3000",
        # Добавьте сюда другие домены, если нужно
    ])

    # Инициализация расширений
    db.init_app(app)

    # Настройка логирования
    if not os.path.exists("logs"):
        os.mkdir("logs")
    logging.basicConfig(
        filename="logs/app.log",
        level=logging.DEBUG,
        format="%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]"
    )
    app.logger.info("🔧 Flask app initialized")

    # Регистрация Blueprint
    app.register_blueprint(main)

    with app.app_context():
        db.create_all()
        app.logger.info("📦 Database tables created")

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
