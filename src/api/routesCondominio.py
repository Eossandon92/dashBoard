from flask import Blueprint, request, jsonify
from api.models import db, Condominio, User

condominios_bp = Blueprint("condominios", __name__)


@condominios_bp.route("/condominios", methods=["GET"])
def get_condominios():
    condominios = Condominio.query.order_by(Condominio.created_at.desc()).all()

    return jsonify([
        {
            "id": c.id,
            "nombre": c.nombre,
            "comuna": c.comuna,
            "direccion": c.direccion,
            "total_unidades": c.total_unidades,
            "email_contacto": c.email_contacto,
            "telefono_contacto": c.telefono_contacto,
            "estado": c.estado,
            "created_at": c.created_at.isoformat(),
            "administrador_id": c.administrador_id,
            "administrador_nombre": (
                f"{c.administrador.first_name} {c.administrador.last_name}"
                if c.administrador else "Sin asignar"
            )
        }
        for c in condominios
    ]), 200

# ============================
# UPDATE CONDOMINIO
# ============================
@condominios_bp.route("/condominios/<int:id>", methods=["PUT"])
def update_condominio(id):
    condominio = Condominio.query.get(id)

    if not condominio:
        return jsonify({"msg": "Condominio no encontrado"}), 404

    data = request.json

    condominio.nombre = data.get("nombre", condominio.nombre)
    condominio.comuna = data.get("comuna", condominio.comuna)
    condominio.direccion = data.get("direccion", condominio.direccion)
    condominio.estado = data.get("estado", condominio.estado)
    condominio.total_unidades = data.get("total_unidades", condominio.total_unidades)
    condominio.email_contacto = data.get("email_contacto", condominio.email_contacto)
    condominio.telefono_contacto = data.get("telefono_contacto", condominio.telefono_contacto)

    # cambiar administrador si viene
    administrador_id = data.get("administrador_id")
    if administrador_id:
        admin = User.query.get(administrador_id)
        if not admin:
            return jsonify({"msg": "Administrador inválido"}), 400
        condominio.administrador_id = administrador_id

    db.session.commit()

    return jsonify({"msg": "Condominio actualizado correctamente"}), 200


# ============================
# DELETE CONDOMINIO
# ============================
@condominios_bp.route("/condominios/<int:id>", methods=["DELETE"])
def delete_condominio(id):
    condominio = Condominio.query.get(id)

    if not condominio:
        return jsonify({"msg": "Condominio no encontrado"}), 404

    db.session.delete(condominio)
    db.session.commit()

    return jsonify({"msg": "Condominio eliminado"}), 200

@condominios_bp.route("/condominios", methods=["POST"])
def create_condominio():
    data = request.json
    if not data.get("administrador_id"):
        return jsonify({
            "msg": "El administrador es obligatorio"
        }), 400
    condominio = Condominio(
        nombre=data.get("nombre"),
        comuna=data.get("comuna"),
        direccion=data.get("direccion"),
        total_unidades=data.get("total_unidades"),
        email_contacto=data.get("email_contacto"),
        telefono_contacto=data.get("telefono_contacto"),
        estado=data.get("estado", "Activo"),
        administrador_id=data.get("administrador_id"),
    )

    db.session.add(condominio)
    db.session.commit()

    return jsonify({"msg": "Condominio creado correctamente"}), 201
