from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from api.models import db, User, Role

users_bp = Blueprint("users_bp", __name__)

# ============================
# GET ALL USERS
# ============================
@users_bp.route("/users", methods=["GET"])
def get_users():
    users = User.query.order_by(User.created_at.desc()).all()

    return jsonify([
        {
            "id": u.id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "is_active": u.is_active,
            "condominio_id": u.condominio_id,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "roles": [r.name for r in u.roles],
        }
        for u in users
    ]), 200


# ============================
# CREATE USER
# ============================
@users_bp.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()

    required_fields = ["first_name", "last_name", "email", "password"]

    for field in required_fields:
        if not data.get(field):
            return jsonify({"message": f"Campo requerido: {field}"}), 400

    # validar email único
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email ya registrado"}), 409

    hashed_password = generate_password_hash(data["password"])

    new_user = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        password=hashed_password,
        is_active=data.get("is_active", True),
        condominio_id=data.get("condominio_id")
    )

    # asignar roles si vienen
    if "roles" in data:
        roles = Role.query.filter(Role.name.in_(data["roles"])).all()
        new_user.roles = roles

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "id": new_user.id,
        "first_name": new_user.first_name,
        "last_name": new_user.last_name,
        "email": new_user.email,
        "is_active": new_user.is_active,
        "condominio_id": new_user.condominio_id,
        "roles": [r.name for r in new_user.roles],
    }), 201


# ============================
# UPDATE USER
# ============================
@users_bp.route("/users/<int:id>", methods=["PUT"])
def update_user(id):
    user = User.query.get(id)

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    data = request.get_json()

    # validar email duplicado
    if "email" in data and data["email"] != user.email:
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"msg": "Email ya registrado"}), 409

    user.first_name = data.get("first_name", user.first_name)
    user.last_name = data.get("last_name", user.last_name)
    user.email = data.get("email", user.email)
    user.is_active = data.get("is_active", user.is_active)

    # actualizar condominio
    if "condominio_id" in data:
        user.condominio_id = data["condominio_id"]

    # actualizar password solo si viene
    if data.get("password"):
        user.password = generate_password_hash(data["password"])

    # actualizar roles
    if "roles" in data:
        roles = Role.query.filter(Role.name.in_(data["roles"])).all()
        user.roles = roles

    db.session.commit()

    return jsonify({"msg": "Usuario actualizado correctamente"}), 200


# ============================
# DELETE USER
# ============================
@users_bp.route("/users/<int:id>", methods=["DELETE"])
def delete_user(id):
    user = User.query.get(id)

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"msg": "Usuario eliminado correctamente"}), 200
