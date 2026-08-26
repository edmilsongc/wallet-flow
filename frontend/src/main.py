from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/register")
def register():
    return render_template("register.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/accounts-receivable")
def accounts_receivable():
    return render_template("accounts-receivable.html")

@app.route("/accounts-payable")
def accounts_payable():
    return render_template("accounts-payable.html")

@app.route("/investment-plans")
def investment_plans():
    return render_template("investment-plans.html")

@app.route("/statements")
def statements():
    return render_template("statements.html")

@app.route("/transactions")
def transactions():
    return render_template("transactions.html")

@app.route("/support")
def support():
    return render_template("support.html")

@app.route("/settings")
def settings():
    return render_template("settings.html")

if __name__ == "__main__":
    app.run()