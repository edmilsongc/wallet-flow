from flask import Blueprint, session, jsonify
from database.connection import get_connection

dataUser_bp = Blueprint("dataUser", __name__, url_prefix="/api")

@dataUser_bp.route('/dashboard')
def api_dashboard():
    user_id = session.get('user_id')

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("select name from users where id = %s", (user_id,))
    user = cursor.fetchone()
    
    cursor.close()
    conn.close()

    return jsonify({
        'user': user
    })