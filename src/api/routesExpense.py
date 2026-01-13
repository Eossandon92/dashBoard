from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from api.models import db, User, Role, ExpenseCategory, Expense, ExpenseStatus
from datetime import date, datetime
from sqlalchemy.orm import joinedload

expenses_bp = Blueprint("expenses_bp", __name__)


# ============================
# GET ALL EXPENSES CATEGORY
# ============================
@expenses_bp.route("/expenses/category", methods=["GET"])
def get_expenses_category():
    categories = ExpenseCategory.query.all()

    return jsonify([
        {
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "is_active": c.is_active
        }
        for c in categories
    ]), 200

# ============================
# GET ALL EXPENSES
# ============================
@expenses_bp.route("/expenses", methods=["GET"])
def get_expenses():
    expenses = Expense.query.order_by(Expense.expense_date.desc()).all()

    return jsonify([
        {   
            "id": e.id,
            "provider_id": e.provider_id,
            "category_id": e.category_id,
            "condominium_id": e.condominium_id,
            "amount": e.amount,
            "description": e.observation,
            "date": e.expense_date,
            "document_number": e.document_number,
            "status": e.status.name if e.status else "Pendiente",
            "created_at": e.created_at.isoformat() if e.created_at else None,
        }
        for e in expenses
    ]), 200

# ============================
# GET ALL EXPENSES MONTHLY
# ============================
@expenses_bp.route("/expenses/monthly", methods=["GET"])
def get_expenses_monthly():
    condominium_id = request.args.get("condominium_id", type=int)
    month = request.args.get("month", type=int)
    year = request.args.get("year", type=int)

    today = date.today()

    if not month:
        month = today.month
    if not year:
        year = today.year

    start = date(year, month, 1)

    if month == 12:
        end = date(year + 1, 1, 1)
    else:
        end = date(year, month + 1, 1)

    print("START:", start)
    print("END:", end)

    expenses = Expense.query.filter(
        Expense.condominium_id == condominium_id,
        Expense.expense_date >= start,
        Expense.expense_date < end
    ).all()

    return jsonify({
    "month": month,
    "year": year,
    "total_amount": sum(e.amount for e in expenses),
    "count": len(expenses),
    "expenses": [
        {
            "id": e.id,
            "expense_date": e.expense_date.isoformat(),
            "amount": e.amount,
            "category_id": e.category_id,
            "provider_id": e.provider_id,
            "document_number": e.document_number,
            "observation": e.observation,
        }
        for e in expenses
    ]
}), 200


# ============================
# CREATE EXPENSE
# ============================
@expenses_bp.route("/expenses", methods=["POST"])
def create_expense():
    from datetime import datetime
    from decimal import Decimal

    data = request.form  

    required_fields = [
        "provider_id",
        "category_id",
        "condominium_id",
        "expense_date",
        "observation",
        "amount",
        "document_number",
    ]

    for field in required_fields:
        if not data.get(field):
            return jsonify({"message": f"Campo requerido: {field}"}), 400

    # Determinar expense_status_id (default 1 si no viene)
    # Asumiendo que 1 es 'Pendiente'
    expense_status_id = data.get("expense_status_id", 1)

    new_expense = Expense(
        provider_id=data.get("provider_id"),
        category_id=data.get("category_id"),
        condominium_id=data.get("condominium_id"),
        expense_date=datetime.strptime(
            data.get("expense_date"), "%Y-%m-%d"
        ).date(),
        observation=data.get("observation"),
        amount=Decimal(data.get("amount")),
        document_number=data.get("document_number"),
        expense_status_id=expense_status_id # Cambio de status string a ID
    )

    db.session.add(new_expense)
    db.session.commit()

    return jsonify({
        "id": new_expense.id,
        "provider_id": new_expense.provider_id,
        "category_id": new_expense.category_id,
        "amount": float(new_expense.amount),
        "observation": new_expense.observation,
        "document_number": new_expense.document_number,
        "expense_date": new_expense.expense_date.isoformat(),
        "status": new_expense.status.name if new_expense.status else "Pendiente",
    }), 201


@expenses_bp.route("/expenses/condominium", methods=["GET"])
def get_expenses_by_condominium():
    condominium_id = request.args.get("condominium_id")

    if not condominium_id:
        return jsonify({"message": "condominium_id es requerido"}), 400

    expenses = (
        Expense.query
        .options(
            joinedload(Expense.provider),
            joinedload(Expense.category),
            joinedload(Expense.status)
        )
        .filter_by(condominium_id=condominium_id)
        .order_by(Expense.expense_date.desc())
        .all()
    )

    return jsonify([
        {
            "id": e.id,
            "provider_id": e.provider_id,
            "provider_name": e.provider.name if e.provider else None,
            "category_id": e.category_id,
            "category_name": e.category.name if e.category else None,
            "condominium_id": e.condominium_id,
            "amount": float(e.amount),
            "observation": e.observation,
            "document_number": e.document_number,
            "expense_date": e.expense_date.isoformat(),
            "status": e.status.name if e.status else "Pendiente",
            "expense_status_id": e.expense_status_id, # return ID for editing
        }
        for e in expenses
    ]), 200

# ============================
# UPDATE EXPENSE (PUT)
# ============================
@expenses_bp.route("/expenses/<int:expense_id>", methods=["PUT"])
def update_expense(expense_id):
    # 1. Asegúrate de leer JSON si viene de Axios
    data = request.get_json() 
    if not data:
        data = request.form # Fallback por si usas Postman con form-data

    expense = Expense.query.get(expense_id)
    if not expense:
        return jsonify({"message": "Gasto no encontrado"}), 404
    
    # Actualización de campos
    expense.provider_id = data.get("provider_id", expense.provider_id)
    expense.category_id = data.get("category_id", expense.category_id)
    expense.condominium_id = data.get("condominium_id", expense.condominium_id)
    expense.observation = data.get("observation", expense.observation)
    expense.document_number = data.get("document_number", expense.document_number)
    expense.expense_date = data.get("expense_date", expense.expense_date)
    expense.expense_status_id = data.get("expense_status_id", expense.expense_status_id) # Update status ID
    
    new_status_id = data.get("expense_status_id") or data.get("status_id")
    
    if new_status_id:
        expense.expense_status_id = int(new_status_id)
    # Manejo seguro de Amount (Decimal) y Fechas
    if "amount" in data:
        expense.amount = data["amount"] # SQLAlchemy se encarga de convertir a Decimal al guardar
        
    # ... lógica de fecha ...

    try:
        db.session.commit() # <--- AQUÍ SE GUARDA EL DATO. SI PASA ESTO, EL DATO ESTÁ SALVADO.
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

    # ==============================================================
    # AQUÍ ES DONDE SUELE DAR EL ERROR 500 DE SERIALIZACIÓN
    # ==============================================================
    return jsonify({
        "id": expense.id,
        "provider_id": expense.provider_id,
        "category_id": expense.category_id,
        # IMPORTANTE: Convertir Decimal a float
        "amount": float(expense.amount) if expense.amount else 0.0, 
        "observation": expense.observation,
        "document_number": expense.document_number,
        "status": expense.status.name if expense.status else None,
        "expense_status_id": expense.expense_status_id,
        # IMPORTANTE: Convertir fecha a string ISO
        "expense_date": expense.expense_date.isoformat() if expense.expense_date else None 
    }), 200

@expenses_bp.route("/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    expense = Expense.query.get(expense_id)
    if not expense:
        return jsonify({"message": "Gasto no encontrado"}), 404
    
    db.session.delete(expense)
    db.session.commit()
    
    return jsonify({"message": "Gasto eliminado exitosamente"}), 200

@expenses_bp.route("/expenses/status", methods=["GET"])
def get_expenses_status():
    statuses = ExpenseStatus.query.filter_by(is_active=True).all()
    return jsonify([
        {
            "id": s.id,
            "name": s.name,
            "description": s.description
        } 
        for s in statuses
    ]), 200
    