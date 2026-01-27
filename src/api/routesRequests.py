from flask import request, jsonify
from api.models import db, CommonArea, Request,Condominio,User
from flask import Blueprint

requests_bp = Blueprint("requests_bp", __name__)
# GET ALL & POST (Crear)
@requests_bp.route('/common-areas', methods=['GET', 'POST'])
def handle_common_areas():
    if request.method == 'GET':
        condo_id = request.args.get('condominio_id')
        areas = CommonArea.query.filter_by(condominium_id=condo_id).all()
        return jsonify([area.serialize() for area in areas]), 200

    if request.method == 'POST':
        data = request.get_json() # Usamos get_json() para mayor seguridad
        
        # BLINDAJE: Verificamos si la llave existe antes de usarla
        condo_id = data.get('condominium_id') or data.get('condominio_id')
        
        if not condo_id:
            return jsonify({"error": "Falta el ID del condominio"}), 400
        
        new_area = CommonArea(
            condominium_id=condo_id, # Usamos la variable validada
            name=data.get('name'),
            description=data.get('description', ''),
            price=data.get('price', 0),
            is_active=True
        )
        
        try:
            db.session.add(new_area)
            db.session.commit()
            return jsonify(new_area.serialize()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

# PUT (Editar) & DELETE (Borrar)
@requests_bp.route('/common-areas/<int:id>', methods=['PUT', 'DELETE'])
def update_delete_area(id):
    area = CommonArea.query.get_or_404(id)

    if request.method == 'PUT':
        data = request.json
        area.name = data.get('name', area.name)
        area.description = data.get('description', area.description)
        area.price = data.get('price', area.price)
        area.is_active = data.get('is_active', area.is_active)
        db.session.commit()
        return jsonify(area.serialize()), 200

    if request.method == 'DELETE':
        db.session.delete(area)
        db.session.commit()
        return jsonify({"msg": "Área eliminada con éxito"}), 200

@requests_bp.route('/requests', methods=['GET', 'POST'])
def handle_requests():
    if request.method == 'GET':
        condo_id = request.args.get('condominio_id')
        items = Request.query.filter_by(condominium_id=condo_id).all()
        return jsonify([i.serialize() for i in items]), 200

    if request.method == 'POST':
        data = request.json
        
        # --- LÓGICA DE VALIDACIÓN DE DISPONIBILIDAD ---
        if data.get('request_type') == "Reserva":
            # Buscamos si existe otra solicitud APROBADA para el mismo lugar y fecha
            conflict = Request.query.filter(
                Request.condominium_id == data['condominium_id'],
                Request.common_area_id == data['common_area_id'],
                Request.request_date == data['request_date'],
                Request.status_id == 2  # 2: Aprobado / Ocupado
            ).first()

            if conflict:
                return jsonify({"error": "El lugar ya está reservado para esta fecha"}), 409
        # ----------------------------------------------

        new_req = Request(
            condominium_id=data['condominium_id'],
            resident_name=data['resident_name'],
            unit_number=data['unit_number'],
            request_type=data['request_type'],
            common_area_id=data.get('common_area_id'), # Puede ser null si no es reserva
            subject=data['subject'],
            description=data.get('description', ''),
            request_date=data['request_date'],
            status_id=1 # Siempre inicia como Pendiente
        )
        db.session.add(new_req)
        db.session.commit()
        return jsonify(new_req.serialize()), 201

@requests_bp.route('/requests/<int:id>', methods=['PUT', 'DELETE'])
def update_delete_request(id):
    req_item = Request.query.get_or_404(id)

    if request.method == 'PUT':
        data = request.json
        # Permitir cambiar estado (Aprobar/Rechazar) o editar datos
        if 'status_id' in data:
            req_item.status_id = data['status_id']
        req_item.subject = data.get('subject', req_item.subject)
        req_item.description = data.get('description', req_item.description)
        
        db.session.commit()
        return jsonify(req_item.serialize()), 200

    if request.method == 'DELETE':
        db.session.delete(req_item)
        db.session.commit()
        return jsonify({"msg": "Solicitud eliminada"}), 200


@requests_bp.route('/requests/check', methods=['GET'])  
def check_availability():
    date = request.args.get('date')
    area_id = request.args.get('area_id')
    condo_id = request.args.get('condominio_id')

    exists = Request.query.filter_by(
        condominium_id=condo_id,
        common_area_id=area_id,
        request_date=date,
        status_id=2
    ).first()

    return jsonify({"available": False if exists else True}), 200