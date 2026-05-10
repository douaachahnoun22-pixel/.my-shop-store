from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS


db = SQLAlchemy()
bcrypt = Bcrypt()


def create_app():
    app = Flask(
        __name__,
        static_folder='../frontend',
        static_url_path='',
        template_folder='../templates',
    )
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../database/app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'luxury-shop-secret-key'

    db.init_app(app)
    bcrypt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    from backend.routes import api
    app.register_blueprint(api, url_prefix='/api')

    return app
