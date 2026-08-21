from flask import Flask
from routes.auth import auth_bp
from routes.dataUser import dataUser_bp

from dotenv import load_dotenv
from flask_cors import CORS
import os

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')
FRONTEND_URL = os.getenv('FRONTEND_URL')

app = Flask(__name__)
app.secret_key = SECRET_KEY
CORS(
    app,
    supports_credentials=True,
    origins=[FRONTEND_URL]
)

app.register_blueprint(auth_bp)
app.register_blueprint(dataUser_bp)

if __name__ == '__main__':
    app.run()