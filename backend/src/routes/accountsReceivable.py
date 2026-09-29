from flask import Blueprint, session, jsonify, request, json
from src.database.connection import get_connection

accountsReceivable_bp = Blueprint("accountsReceivable", __name__, url_prefix="/data")

@accountsReceivable_bp.route('/accounts-receivable', methods=['POST'])
def data_accounts_receivable():
    data = request.get_json()

    user_id = session.get('user_id')

    description = data.get('description')
    category = data.get('category')
    amount = data.get('amount')
    due_date = data.get('due_date')
    status = data.get('status')
    frequency = data.get('frequency')
    notes = data.get('notes')

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("insert into accounts_receivable (user_id, description, category, amount, due_date, status, frequency, notes) values (%s, %s, %s, %s, %s, %s, %s, %s)", (user_id, description, category, amount, due_date, status, frequency, notes))
    conn.commit()
            
    cursor.close()
    conn.close()

    return jsonify({
        "message": "success"
    }), 200

@accountsReceivable_bp.route('/accounts-receivable/data-user', methods=['GET'])
def data_user_accounts_receivable():
    user_id = session.get('user_id')

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from  accounts_receivable where user_id = %s", (user_id,))
    dataUser = cursor.fetchall()

    cursor.execute("select sum(amount) from accounts_receivable where user_id = %s", (user_id,))
    totalReceber = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT
            COALESCE(SUM(amount) FILTER (WHERE status = 'Pendente'), 0) AS total_pendente,
            COALESCE(SUM(amount) FILTER (WHERE status = 'Recebido'), 0) AS total_recebido,
            COALESCE(SUM(amount) FILTER (WHERE status = 'Em atraso'), 0) AS total_atrasado
        FROM accounts_receivable
        WHERE user_id = %s
        """,
        (user_id,)
    )

    totalPendente, totalRecebido, totalAtrasado = cursor.fetchone()

    cursor.close()
    conn.close()
    
    return jsonify({
        "dataUser": dataUser,
        "totalReceber": totalReceber,
        "totalPendente": totalPendente,
        "totalRecebido": totalRecebido,
        "totalAtrasado": totalAtrasado
    }), 200