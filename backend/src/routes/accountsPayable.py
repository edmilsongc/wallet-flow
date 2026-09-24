from flask import Blueprint, session, jsonify, request, json
from database.connection import get_connection

accountsPayable_bp = Blueprint("accountsPayable", __name__, url_prefix="/data")

@accountsPayable_bp.route('/accounts-payable', methods=['POST'])
def data_accounts_payable():
    data = request.get_json()

    user_id = session.get('user_id')

    description = data.get('description')
    category = data.get('category')
    payable_supplier = data.get('payable_supplier')
    amount = data.get('amount')
    due_date = data.get('due_date')
    status = data.get('status')
    payable_method = data.get('payable_method')
    notes = data.get('notes')

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("insert into accounts_payable (user_id, description, payable_supplier, category, amount, due_date, status, payable_method, notes) values (%s, %s, %s, %s, %s, %s, %s, %s, %s)", (user_id, description, payable_supplier, category, amount, due_date, status, payable_method, notes))
    conn.commit()
            
    cursor.close()
    conn.close()

    return jsonify({
        "message": "success"
    }), 200

@accountsPayable_bp.route('/accounts-payable/data-user', methods=['GET'])
def data_user_accounts_payable():
    user_id = session.get('user_id')

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from  accounts_payable where user_id = %s", (user_id,))
    dataUser = cursor.fetchall()

    cursor.execute("select sum(amount) from accounts_payable where user_id = %s", (user_id,))
    totalPagar = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT
            COALESCE(SUM(amount) FILTER (WHERE status = 'Pendente'), 0) AS total_pendente,
            COALESCE(SUM(amount) FILTER (WHERE status = 'Pago'), 0) AS total_pago,
            COALESCE(SUM(amount) FILTER (WHERE status = 'Atrasado'), 0) AS total_atrasado
        FROM accounts_payable
        WHERE user_id = %s
        """,
        (user_id,)
    )
    
    totalPendente, totalPago, totalAtrasado = cursor.fetchone()

    cursor.close()
    conn.close()
    
    return jsonify({
        "dataUser": dataUser,
        "totalPagar": totalPagar,
        "totalPendente": totalPendente,
        "totalPago": totalPago,
        "totalAtrasado": totalAtrasado
    }), 200