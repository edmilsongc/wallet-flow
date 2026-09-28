from flask import Blueprint, session, jsonify, request
from database.connection import get_connection
import bcrypt

auth_bp = Blueprint("auth", __name__, url_prefix="/api")

@auth_bp.route('/register', methods=['POST'])
def api_register():
    if request.method == 'POST':
        data = request.get_json()

        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        hashed_password = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        )

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("insert into users (name, email, password) values (%s, %s, %s)", (name, email, hashed_password.decode("utf-8")))
        conn.commit()
        
        cursor.close()
        conn.close()
    return jsonify({
        'message': 'success'
    })

@auth_bp.route('/login', methods=['POST'])
def api_login():
    if request.method == 'POST':
        data = request.get_json()

        email = data.get('email')
        password = data.get('password')

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("select * from users where email = %s", (email,))
        user = cursor.fetchone()

        cursor.close()
        conn.close()

        if user is None:
            return jsonify({
                'message': 'user not exists'
            })

        hashed_password = user[3]

        if bcrypt.checkpw(
            password.encode("utf-8"),
            hashed_password.encode("utf-8")
        ):
            session['user_id'] = user[0]
            return jsonify({
                'message': 'success'
            })
        return jsonify({
            'message': 'error'
        })

@auth_bp.route('/session', methods=['GET'])
def session_status():
    user_id = session.get('user_id')

    if user_id is None:
        return jsonify({
            'authenticated': False
        }), 401
    return jsonify({
        'authenticated': True,
        'user_id': user_id
    }), 200