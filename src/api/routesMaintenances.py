from flask import Blueprint, request, jsonify
from api.models import db, Condominio, User, Provider, Maintenance, Expense, AuditLog
from datetime import datetime  # <--- ESTA ES LA LÍNEA QUE FALTA
from sqlalchemy.sql import func
maintenances_bp = Blueprint("maintenances_bp", __name__)



@maintenances_bp.route('/maintenance', methods=['POST'])
def create_maintenance():
    data = request.json
    
    # Validamos que no falten los IDs que son llaves foráneas
    if not data.get("condominium_id") or not data.get("provider_id"):
        return jsonify({"msg": "Faltan IDs de condominio o proveedor"}), 400

    # Creamos la instancia usando EXACTAMENTE los nombres de tu tabla
    new_m = Maintenance(
        title=data['title'],
        description=data.get('description'),
        condominium_id=data['condominium_id'],
        provider_id=data['provider_id'],
        # AQUÍ ESTABA EL ERROR: Usamos el ID, no la relación 'status'
        maintenance_status_id=1, 
        scheduled_date=datetime.strptime(data['scheduled_date'], '%Y-%m-%d').date(),
        estimated_cost=data.get('estimated_cost', 0)
    )

    try:
        db.session.add(new_m)
        db.session.commit()
        return jsonify({"msg": "Mantención creada exitosamente", "id": new_m.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error en el servidor: {str(e)}") # Esto saldrá en tu terminal
        return jsonify({"msg": "Error interno al guardar", "error": str(e)}), 500

@maintenances_bp.route('/maintenance', methods=['GET'])
def get_maintenances():
    condo_id = request.args.get('condominio_id')
    if not condo_id:
        return jsonify({"msg": "Se requiere condominio_id"}), 400
        
    maintenances = Maintenance.query.filter_by(condominium_id=condo_id).all()
    return jsonify([m.serialize() for m in maintenances]), 200

@maintenances_bp.route('/maintenance/<int:id>/pay', methods=['POST'])
def pay_maintenance(id):
    # 1. Buscar la mantención
    maintenance = Maintenance.query.get_or_404(id)
    
    # IMPORTANTE: Usamos maintenance_status_id (2 = Pagada)
    if maintenance.maintenance_status_id == 2:
        return jsonify({"msg": "Esta mantención ya fue pagada anteriormente"}), 400

    data = request.json 
    # Aseguramos que el monto sea flotante para evitar líos con Decimal
    actual_amount = float(data.get('actual_cost', maintenance.estimated_cost))

    try:
        # 1. Actualizar la mantención
        maintenance.maintenance_status_id = 2 # Sincronizado con tu tabla de estados
        maintenance.actual_cost = actual_amount
        maintenance.completed_date = func.now()

        # 2. Crear el Gasto automáticamente
        new_expense = Expense(
            provider_id=maintenance.provider_id,
            condominium_id=maintenance.condominium_id,
            maintenance_id=maintenance.id, 
            category_id=data.get('category_id', 1), 
            expense_date=func.now(),
            amount=actual_amount,
            observation=f"Gasto automático de Mantención: {maintenance.title}",
            expense_status_id=2 # Pagado
        )

        # 3. Registrar en Auditoría
        new_audit = AuditLog(
            user_id=data.get('user_id'), 
            action="PAGO_MANTENCION",
            entity="Maintenance",
            entity_id=maintenance.id
        )

        db.session.add(new_expense)
        db.session.add(new_audit)
        
        # Guardamos todo junto. Si algo falla aquí, nada se guarda.
        db.session.commit()

        return jsonify({
            "msg": "Mantención pagada y gasto generado correctamente",
            "expense_id": new_expense.id
        }), 200

    except Exception as e:
        db.session.rollback() # Si falla el insert del gasto, revertimos el cambio de estado
        print(f"Error en el pago: {str(e)}")
        return jsonify({"msg": "Error al procesar el pago", "error": str(e)}), 500

@maintenances_bp.route('/maintenance/<int:id>', methods=['PUT'])
def update_maintenance(id):
    maintenance = Maintenance.query.get_or_404(id)
    data = request.json

    # Si ya está pagada, quizás no deberías dejar editar costos
    if maintenance.status == "Pagada":
        return jsonify({"msg": "No se puede editar una mantención ya pagada"}), 400

    maintenance.title = data.get('title', maintenance.title)
    maintenance.description = data.get('description', maintenance.description)
    maintenance.scheduled_date = data.get('scheduled_date', maintenance.scheduled_date)
    maintenance.estimated_cost = data.get('estimated_cost', maintenance.estimated_cost)
    maintenance.provider_id = data.get('provider_id', maintenance.provider_id)
    
    db.session.commit()
    return jsonify({"msg": "Mantención actualizada con éxito"}), 200

@maintenances_bp.route('/maintenance/<int:id>', methods=['DELETE'])
def delete_maintenance(id):
    maintenance = Maintenance.query.get_or_404(id)

    # Regla de negocio: No borrar si ya tiene gasto asociado
    if maintenance.expense:
        return jsonify({"msg": "No se puede eliminar: tiene un gasto asociado. Anule el gasto primero."}), 400

    db.session.delete(maintenance)
    db.session.commit()
    return jsonify({"msg": "Mantención eliminada"}), 200