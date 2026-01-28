from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import (
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Table,
    Column,
    Integer,
    Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

db = SQLAlchemy()

# =====================================================
# TABLA INTERMEDIA USER <-> ROLE
# =====================================================
user_roles = Table(
    "user_roles",
    db.metadata,
    Column("user_id", ForeignKey("users.id"), primary_key=True),
    Column("role_id", ForeignKey("roles.id"), primary_key=True),
)

# =====================================================
# USER
# =====================================================
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(Integer, primary_key=True)

    first_name = db.Column(String(50), nullable=False)
    last_name = db.Column(String(50), nullable=False)
    email = db.Column(String(120), unique=True, nullable=False)
    password = db.Column(String(255), nullable=False)

    is_active = db.Column(Boolean, default=True, nullable=False)

    created_at = db.Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # =====================================
    # CONDOMINIO AL QUE PERTENECE
    # (ADMIN y USER → uno solo)
    # SUPERADMIN → puede ser NULL
    # =====================================
    condominio_id = db.Column(
        Integer,
        ForeignKey("condominios.id"),
        nullable=True
    )

    condominio = relationship(
        "Condominio",
        back_populates="usuarios",
        foreign_keys=[condominio_id]
    )

    # =====================================
    # ROLES: SUPERADMIN | ADMIN | USER
    # =====================================
    roles = relationship(
        "Role",
        secondary=user_roles,
        back_populates="users"
    )

    def __repr__(self):
        return f"<User {self.email}>"

# =====================================================
# ROLE
# =====================================================
class Role(db.Model):
    __tablename__ = "roles"

    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(50), unique=True, nullable=False)

    users = relationship(
        "User",
        secondary=user_roles,
        back_populates="roles"
    )

    def __repr__(self):
        return f"<Role {self.name}>"

# =====================================================
# CONDOMINIO
# =====================================================
class Condominio(db.Model):
    __tablename__ = "condominios"

    id = db.Column(Integer, primary_key=True)

    # =====================================
    # ADMIN DEL CONDOMINIO (USER con rol ADMIN)
    # =====================================
    administrador_id = db.Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    administrador = relationship(
        "User",
        foreign_keys=[administrador_id],
        backref="condominios_admin"
    )

    # =====================================
    # USUARIOS DEL CONDOMINIO
    # =====================================
    usuarios = relationship(
        "User",
        back_populates="condominio",
        foreign_keys="User.condominio_id"
    )

    # =====================================
    # DATOS DEL CONDOMINIO
    # =====================================
    nombre = db.Column(String(150), nullable=False)
    comuna = db.Column(String(100), nullable=False)
    direccion = db.Column(String(200), nullable=False)

    estado = db.Column(
        String(20),
        nullable=False,
        default="Activo"
    )  # Activo | Inactivo | Moroso

    total_unidades = db.Column(Integer, nullable=False)

    email_contacto = db.Column(String(120))
    telefono_contacto = db.Column(String(30))

    created_at = db.Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = db.Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    def __repr__(self):
        return f"<Condominio {self.nombre}>"

# =====================================================
# PROVIDER
# =====================================================
class Provider(db.Model):
    __tablename__ = "providers"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(120), nullable=False)
    service_type = db.Column(db.String(80), nullable=False)

    rut = db.Column(db.String(20), unique=True, nullable=True)
    email = db.Column(db.String(120), nullable=True)
    phone = db.Column(db.String(30), nullable=True)
    address = db.Column(db.String(200), nullable=True)

    notes = db.Column(db.Text, nullable=True)

    is_active = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "service_type": self.service_type,
            "rut": self.rut,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "notes": self.notes,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat()
        }

# =====================================================
# EXPENSE CATEGORY
# =====================================================
class ExpenseCategory(db.Model):
    __tablename__ = "expense_categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)

# =====================================================
# EXPENSE
# =====================================================
class Expense(db.Model):
    __tablename__ = "expenses"

    id = db.Column(db.Integer, primary_key=True)

    provider_id = db.Column(
        db.Integer,
        db.ForeignKey("providers.id"),
        nullable=False
    )

    # CORRECCIÓN: Agregué ForeignKey para integridad referencial
    condominium_id = db.Column(
        db.Integer, 
        db.ForeignKey("condominios.id"), 
        nullable=False
    ) 
    maintenance_id = db.Column(
        db.Integer, 
        db.ForeignKey("maintenances.id"), 
        nullable=True
    )
    category_id = db.Column(
        db.Integer,
        db.ForeignKey("expense_categories.id"),
        nullable=False
    )

    # NUEVO: Relación con la tabla de estados
    expense_status_id = db.Column(
        db.Integer,
        db.ForeignKey("expense_statuses.id"),
        nullable=True,
        default=1 # Asumiendo que el ID 1 es "Pendiente" o "Registrado"
    )

    expense_date = db.Column(db.Date, nullable=False)
    observation = db.Column(Text, nullable=True)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    document_number = db.Column(db.String(100))
    is_recurring = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now()
    )

    # Relaciones (Joins)
    provider = db.relationship("Provider")
    category = db.relationship("ExpenseCategory")
    condominium = db.relationship("Condominio") # Relación útil para acceder a datos del condominio desde el gasto
    maintenance = db.relationship("Maintenance", backref=db.backref("expense", uselist=False))
    # Relación con el estado
    status = db.relationship("ExpenseStatus")
    def serialize(self):
        return {
        "id": self.id,
        "amount": float(self.amount),
        "expense_date": self.expense_date.isoformat(),
        "provider_id": self.provider_id,
        "maintenance_id": self.maintenance_id, # Clave para el front
        "status": self.status.name if self.status else None,
        "document_number": self.document_number,
        "observation": self.observation
    }

# =====================================================
# EXPENSE DOCUMENT
# =====================================================
class ExpenseDocument(db.Model):
    __tablename__ = "expense_documents"

    id = db.Column(db.Integer, primary_key=True)

    expense_id = db.Column(
        db.Integer,
        db.ForeignKey("expenses.id"),
        nullable=False
    )

    document_type = db.Column(db.String(50))  # invoice, receipt, quote
    file_path = db.Column(db.String(255), nullable=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now())

    expense = db.relationship("Expense")

# =====================================================
# EXPENSE STATUS
# =====================================================
class ExpenseStatus(db.Model):
    __tablename__ = "expense_statuses"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False) # Ej: Pendiente, Pagado
    description = db.Column(db.String(255), nullable=True)  
    is_active = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f"<ExpenseStatus {self.name}>"

# =====================================================
# MAINTENANCE
# =====================================================
class Maintenance(db.Model):
    __tablename__ = "maintenances"

    id = db.Column(db.Integer, primary_key=True)
    
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Relaciones obligatorias
    condominium_id = db.Column(db.Integer, db.ForeignKey("condominios.id"), nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey("providers.id"), nullable=False)
    
    # NUEVO: Relación con la tabla de estados que ya usas en Expenses
    maintenance_status_id = db.Column(
        db.Integer, 
        db.ForeignKey("expense_statuses.id"), 
        nullable=False, 
        default=1 # Asumiendo que 1 es 'Pendiente'
    )
    
    # Control de tiempos y costos
    scheduled_date = db.Column(db.Date, nullable=False)
    completed_date = db.Column(db.Date, nullable=True)
    
    estimated_cost = db.Column(db.Numeric(10, 2), default=0.00)
    actual_cost = db.Column(db.Numeric(10, 2), default=0.00)
    
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # Relaciones para fácil acceso
    condominium = db.relationship("Condominio", backref="maintenances")
    provider = db.relationship("Provider", backref="maintenances")
    # Relación con el estado para obtener el nombre (ej: "Pagado", "Pendiente")
    status = db.relationship("ExpenseStatus")

    def __repr__(self):
        # Ahora el status viene de la relación
        status_name = self.status.name if self.status else "Sin Estado"
        return f"<Maintenance {self.title} - {status_name}>"

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "condominium_id": self.condominium_id,
            "provider_id": self.provider_id,
            "provider_name": self.provider.name if self.provider else None,
            "scheduled_date": self.scheduled_date.isoformat() if self.scheduled_date else None,
            "completed_date": self.completed_date.isoformat() if self.completed_date else None,
            "estimated_cost": float(self.estimated_cost),
            "actual_cost": float(self.actual_cost),
            # Enviamos tanto el ID como el Nombre para el Front-end
            "status_id": self.maintenance_status_id,
            "status_name": self.status.name if self.status else "Pendiente",
            "has_expense": True if self.expense else False
        }

# =====================================================
# REQUEST
# =====================================================
class Request(db.Model):
    __tablename__ = 'requests'
    id = db.Column(db.Integer, primary_key=True)
    condominium_id = db.Column(db.Integer, db.ForeignKey('condominios.id'), nullable=False)
    
    # Quién pide
    resident_name = db.Column(db.String(100), nullable=False)
    unit_number = db.Column(db.String(20), nullable=False) # Depto
    
    # Qué pide
    request_type = db.Column(db.String(50), nullable=False) # "Reserva", "Reclamo", "Sugerencia"
    # El lugar (Solo si es Reserva, por eso nullable=True)
    common_area_id = db.Column(db.Integer, db.ForeignKey('common_areas.id'), nullable=True)
    
    subject = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    
    # Cuándo
    request_date = db.Column(db.Date, nullable=False) # Fecha del evento/solicitud
    created_at = db.Column(db.DateTime, default=func.now())
    
    # Estado (1: Pendiente, 2: Aprobado/Ocupado, 3: Rechazado/Anulado)
    status_id = db.Column(db.Integer, default=1)

    def serialize(self):
        return {
            "id": self.id,
            "condominium_id": self.condominium_id,
            "resident_name": self.resident_name,
            "unit_number": self.unit_number,
            "request_type": self.request_type,
            "common_area_id": self.common_area_id,
            "subject": self.subject,
            "description": self.description,
            "request_date": self.request_date.isoformat(),
            "status_id": self.status_id,
            "status_name": "Pendiente" if self.status_id == 1 else "Aprobado" if self.status_id == 2 else "Rechazado"
        }
# =====================================================
# COMMON AREA
# =====================================================
class CommonArea(db.Model):
    __tablename__ = 'common_areas'
    id = db.Column(db.Integer, primary_key=True)
    # Relación vital: ¿A qué condominio pertenece este quincho/sala?
    condominium_id = db.Column(db.Integer, db.ForeignKey('condominios.id'), nullable=False)
    
    name = db.Column(db.String(100), nullable=False) # Ej: Quincho 1
    description = db.Column(db.String(255))
    price = db.Column(db.Integer, default=0) # Costo por uso
    is_active = db.Column(db.Boolean, default=True)

    def serialize(self):
        return {
            "id": self.id,
            "condominium_id": self.condominium_id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "is_active": self.is_active
        }


# =====================================================
# VISIT
# =====================================================


class Visit(db.Model):
    __tablename__ = 'visits'
    
    id = db.Column(db.Integer, primary_key=True)
    condominium_id = db.Column(db.Integer, db.ForeignKey('condominios.id'), nullable=False)
    
    # Datos de la Visita
    visitor_name = db.Column(db.String(100), nullable=False)
    visitor_rut = db.Column(db.String(20), nullable=True)     # Opcional
    unit_number = db.Column(db.String(20), nullable=False)    # Depto destino
    patent = db.Column(db.String(20), nullable=True)          # Patente (Opcional)
    
    # Tiempos
    entry_time = db.Column(db.DateTime, default=datetime.now) # Se marca solo al crear
    exit_time = db.Column(db.DateTime, nullable=True)         # Se llena al salir
    
    comment = db.Column(db.String(200), nullable=True)
    
    # Relación (Opcional, si quieres acceder a datos del condominio desde la visita)
    # condominium = db.relationship('Condominium', backref='visits')

    def serialize(self):
        return {
            "id": self.id,
            "condominium_id": self.condominium_id, # Importante devolverlo también
            "visitor_name": self.visitor_name,
            "visitor_rut": self.visitor_rut,
            "unit_number": self.unit_number,
            "patent": self.patent,
            "entry_time": self.entry_time.isoformat() if self.entry_time else None,
            "exit_time": self.exit_time.isoformat() if self.exit_time else None,
            "is_active": self.exit_time is None, # Ayuda al frontend a saber si sigue dentro
            "comment": self.comment
        }

class Delivery(db.Model):
    __tablename__ = 'deliveries'
    
    id = db.Column(db.Integer, primary_key=True)
    condominium_id = db.Column(db.Integer, db.ForeignKey('condominios.id'), nullable=False) # O el nombre que tengas
    
    # Datos simplificados
    unit_number = db.Column(db.String(20), nullable=False)    # Depto 402
    recipient_name = db.Column(db.String(100), nullable=True) # "Juan Pérez" (Opcional)
    tracking_code = db.Column(db.String(100), nullable=True)  # Código etiqueta (Opcional)
    
    # Tiempos
    arrival_time = db.Column(db.DateTime, default=datetime.now) 
    pickup_time = db.Column(db.DateTime, nullable=True)         
    
    status = db.Column(db.String(20), default='pending') 
    comment = db.Column(db.String(200), nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "condominium_id": self.condominium_id,
            "unit_number": self.unit_number,
            "recipient_name": self.recipient_name,
            "tracking_code": self.tracking_code,
            "arrival_time": self.arrival_time.isoformat() if self.arrival_time else None,
            "pickup_time": self.pickup_time.isoformat() if self.pickup_time else None,
            "status": self.status,
            "comment": self.comment
        }
# =====================================================
# AUDIT LOG
# =====================================================
class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)

    action = db.Column(db.String(100), nullable=False)
    entity = db.Column(db.String(50), nullable=False)
    entity_id = db.Column(db.Integer, nullable=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
