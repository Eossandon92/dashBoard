from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from api.models import db, User, Role, ExpenseCategory, Expense

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
    expenses = Expense.query.order_by(Expense.created_at.desc()).all()

    return jsonify([
        {   
            "id": e.id,
            "provider_id": e.provider_id,
            "category_id": e.category_id,
            "amount": e.amount,
            "description": e.description,
            "date": e.date,
            "payment_method": e.payment_method,
            "status": e.status,
            "created_at": e.created_at.isoformat() if e.created_at else None,
            "roles": [r.name for r in u.roles],
        }
        for e in expenses
    ]), 200


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
        status="Pendiente"
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
        "status": new_expense.status,
    }), 201
