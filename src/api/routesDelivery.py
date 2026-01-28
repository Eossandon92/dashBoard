from flask import Blueprint, request, jsonify
from api.models import db, Delivery, Condominio
from datetime import datetime

deliveries_bp = Blueprint('deliveries_bp', __name__)

# ==============================================================================
# 1. GET (Listar) y POST (Crear)    
# ==============================================================================
@deliveries_bp.route('/deliveries', methods=['GET', 'POST'])
def handle_deliveries():
    
    # --- GET: Obtener lista de paquetes ---
    if request.method == 'GET':
        condo_id = request.args.get('condominio_id')
        if not condo_id:
            return jsonify({"error": "Falta el ID del condominio"}), 400
            
        # Lógica de Orden:
        # 1. Primero los 'pending' (Pendientes)
        # 2. Luego por fecha de llegada (los más nuevos arriba)
        deliveries = Delivery.query.filter_by(condominium_id=condo_id)\
            .order_by(Delivery.status.desc(), Delivery.arrival_time.desc())\
            .limit(100).all()
            
        return jsonify([d.serialize() for d in deliveries]), 200

    # --- POST: Registrar nuevo paquete ---
    if request.method == 'POST':
        data = request.get_json()
        
        # Validaciones
        condo_id = data.get('condominio_id') or data.get('condominium_id')
        if not condo_id:
            return jsonify({"error": "Falta el ID del condominio"}), 400
            
        if not data.get('unit_number'):
            return jsonify({"error": "Falta el número de unidad"}), 400

        new_delivery = Delivery(
            condominium_id=condo_id,
            unit_number=data.get('unit_number'),      # Obligatorio
            recipient_name=data.get('recipient_name'),# Opcional
            tracking_code=data.get('tracking_code'),  # Opcional
            comment=data.get('comment'),              # Opcional
            status='pending'                          # Por defecto
        )
        
        try:
            db.session.add(new_delivery)
            db.session.commit()
            return jsonify(new_delivery.serialize()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500


# ==============================================================================
# 2. PUT (Editar Datos) y DELETE (Eliminar)
# ==============================================================================
@deliveries_bp.route('/deliveries/<int:id>', methods=['PUT', 'DELETE'])
def update_delete_delivery(id):
    delivery = Delivery.query.get(id)
    if not delivery:
        return jsonify({"error": "Encomienda no encontrada"}), 404

    # --- PUT: Corregir datos (Ej: Se equivocó de depto) ---
    if request.method == 'PUT':
        data = request.get_json()
        
        if 'unit_number' in data:
            delivery.unit_number = data['unit_number']
        if 'recipient_name' in data:
            delivery.recipient_name = data['recipient_name']
        if 'tracking_code' in data:
            delivery.tracking_code = data['tracking_code']
        if 'comment' in data:
            delivery.comment = data['comment']
            
        try:
            db.session.commit()
            return jsonify(delivery.serialize()), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    # --- DELETE: Borrar registro ---
    if request.method == 'DELETE':
        try:
            db.session.delete(delivery)
            db.session.commit()
            return jsonify({"msg": "Registro eliminado correctamente"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500


# ==============================================================================
# 3. PUT ESPECIAL: Marcar como Retirado (Entregar)
# ==============================================================================
@deliveries_bp.route('/deliveries/<int:id>/pickup', methods=['PUT'])
def mark_pickup(id):
    delivery = Delivery.query.get(id)
    if not delivery:
        return jsonify({"error": "Encomienda no encontrada"}), 404
        
    try:
        delivery.pickup_time = datetime.now() # Hora exacta del servidor
        delivery.status = 'picked_up'         # Cambia estado a entregado
        db.session.commit()
        return jsonify(delivery.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500