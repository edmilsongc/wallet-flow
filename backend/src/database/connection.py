from dotenv import load_dotenv
from psycopg import connect
import os

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

def get_connection():
    return connect(DATABASE_URL)