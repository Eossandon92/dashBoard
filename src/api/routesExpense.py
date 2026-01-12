from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from api.models import db, User, Role, ExpenseCategory, Expense
from datetime import date
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
            "status": e.status,
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


@expenses_bp.route("/expenses/condominium", methods=["GET"])
def get_expenses_by_condominium():
    condominium_id = request.args.get("condominium_id")

    if not condominium_id:
        return jsonify({"message": "condominium_id es requerido"}), 400

    expenses = (
        Expense.query
        .options(
            joinedload(Expense.provider),
            joinedload(Expense.category)
        )
        .filter_by(condominium_id=condominium_id)
        .order_by(Expense.expense_date.desc())
        .all()
    )

    return jsonify([
        {
            "id": e.id,
            "provider_id": e.provider_id,
            "provider_name": e.provider.name if e.provider else None,   # ✅ AQUÍ
            "category_id": e.category_id,
            "category_name": e.category.name if e.category else None,   # ✅ AQUÍ
            "condominium_id": e.condominium_id,
            "amount": float(e.amount),
            "observation": e.observation,
            "document_number": e.document_number,
            "expense_date": e.expense_date.isoformat(),
            "status": e.status,
        }
        for e in expenses
    ]), 200

