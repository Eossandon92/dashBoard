from flask import Blueprint, request, jsonify
from api.models import db, Condominio, User , Provider

providers_bp = Blueprint("providers", __name__)


@providers_bp.route("/providers", methods=["GET"])
def get_providers():
    providers = Provider.query.order_by(Provider.created_at.desc()).all()

    return jsonify([
        {
            "id": c.id,
            "name": c.name,
            "service_type": c.service_type,
            "rut": c.rut,
            "email": c.email,
            "phone": c.phone,
            "address": c.address,
            "is_active": c.is_active,
            "created_at": c.created_at.isoformat(),
        }
        for c in providers
    ]), 200

# ============================
# UPDATE CONDOMINIO
# ============================
@providers_bp.route("/providers/<int:id>", methods=["PUT"])
def update_provider(id):
    provider = Provider.query.get(id)

    if not provider:
        return jsonify({"msg": "Proveedor no encontrado"}), 404

    data = request.json

    provider.name = data.get("name", provider.name)
    provider.service_type = data.get("service_type", provider.service_type)
    provider.rut = data.get("rut", provider.rut)
    provider.email = data.get("email", provider.email)
    provider.phone = data.get("phone", provider.phone)  
    provider.address = data.get("address", provider.address)
    provider.is_active = data.get("is_active", provider.is_active)

    db.session.commit()

    return jsonify({"msg": "Proveedor actualizado correctamente"}), 200


# ============================
# DELETE CONDOMINIO
# ============================
@providers_bp.route("/providers/<int:id>", methods=["DELETE"])
def delete_provider(id):
    provider = Provider.query.get(id)

    if not provider:
        return jsonify({"msg": "Proveedor no encontrado"}), 404

    db.session.delete(provider)
    db.session.commit()

    return jsonify({"msg": "Proveedor eliminado"}), 200

@providers_bp.route("/providers", methods=["POST"])
def create_provider():
    data = request.json
    provider = Provider(
        name=data.get("name"),
        service_type=data.get("service_type"),
        rut=data.get("rut"),
        email=data.get("email"),
        phone=data.get("phone"),
        address=data.get("address"),
        is_active=data.get("is_active", True),
    )

    db.session.add(provider)
    db.session.commit()

    return jsonify({"msg": "Proveedor creado correctamente"}), 201
