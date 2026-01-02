from flask import Blueprint, jsonify
from api.models import Role

roles_bp = Blueprint("roles_bp", __name__)

@roles_bp.route("/roles", methods=["GET"])
def get_roles():
    roles = Role.query.order_by(Role.name.asc()).all()

    return jsonify([
        {
            "id": role.id,
            "name": role.name
        }
        for role in roles
    ])
