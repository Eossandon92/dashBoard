from flask import Blueprint, request, jsonify
from api.models import db, Visit, Condominio
from datetime import datetime

visits_bp = Blueprint('visits_bp', __name__)

# -------------------------------------------------------------------
# 1. GET (Listar) y POST (Crear)
# -------------------------------------------------------------------
@visits_bp.route('/visits', methods=['GET', 'POST'])
def handle_visits():
    
    # --- GET: Listar Visitas ---
    if request.method == 'GET':
        condo_id = request.args.get('condominio_id')
        if not condo_id:
            return jsonify({"error": "Falta el ID del condominio"}), 400
        
        # LOGICA DE ORDEN:
        # 1. Primero las que NO tienen hora de salida (is_active = True)
        # 2. Luego las más recientes por fecha de entrada
        visits = Visit.query.filter_by(condominium_id=condo_id)\
            .order_by(Visit.exit_time.asc(), Visit.entry_time.desc())\
            .limit(100).all()
            
        return jsonify([v.serialize() for v in visits]), 200

    # --- POST: Registrar Entrada ---
    if request.method == 'POST':
        data = request.get_json()
        
        # Validaciones de seguridad
        condo_id = data.get('condominium_id') or data.get('condominio_id')
        if not condo_id:
            return jsonify({"error": "Falta el ID del condominio"}), 400

        if not data.get('visitor_name') or not data.get('unit_number'):
            return jsonify({"error": "Faltan datos obligatorios (Nombre o Unidad)"}), 400
            
        new_visit = Visit(
            condominium_id=condo_id,
            visitor_name=data.get('visitor_name'),
            visitor_rut=data.get('visitor_rut'),
            unit_number=data.get('unit_number'),
            patent=data.get('patent'), # Puede ser None (null)
            comment=data.get('comment')
        )
        
        try:
            db.session.add(new_visit)
            db.session.commit()
            return jsonify(new_visit.serialize()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500


# -------------------------------------------------------------------
# 2. PUT (Editar Datos) y DELETE (Eliminar)
# -------------------------------------------------------------------
@visits_bp.route('/visits/<int:id>', methods=['PUT', 'DELETE'])
def update_delete_visit(id):
    visit = Visit.query.get(id)
    if not visit:
        return jsonify({"error": "Visita no encontrada"}), 404

    # --- PUT: Editar datos (Corrección de errores) ---
    if request.method == 'PUT':
        data = request.get_json()
        
        # Solo actualizamos los campos que vengan en el JSON
        if 'visitor_name' in data:
            visit.visitor_name = data['visitor_name']
        if 'visitor_rut' in data:
            visit.visitor_rut = data['visitor_rut']
        if 'unit_number' in data:
            visit.unit_number = data['unit_number']
        if 'patent' in data:
            visit.patent = data['patent']
        if 'comment' in data:
            visit.comment = data['comment']
            
        # Opcional: Permitir editar la hora de entrada/salida manualmente si es Admin
        # if 'entry_time' in data: ...
            
        try:
            db.session.commit()
            return jsonify(visit.serialize()), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    # --- DELETE: Eliminar registro ---
    if request.method == 'DELETE':
        try:
            db.session.delete(visit)
            db.session.commit()
            return jsonify({"message": "Visita eliminada correctamente"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500


# -------------------------------------------------------------------
# 3. PUT ESPECIAL: Marcar Salida (Check-out rápido)
# -------------------------------------------------------------------
@visits_bp.route('/visits/<int:id>/exit', methods=['PUT'])
def mark_exit(id):
    visit = Visit.query.get(id)
    
    if not visit:
        return jsonify({"error": "Visita no encontrada"}), 404
        
    if visit.exit_time:
        return jsonify({"error": "Esta visita ya marcó salida"}), 400
        
    try:
        # Marcamos la hora exacta del servidor
        visit.exit_time = datetime.now()
        db.session.commit()
        return jsonify(visit.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500