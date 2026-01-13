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

class ExpenseCategory(db.Model):
    __tablename__ = "expense_categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)

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
    
    # Relación con el estado
    status = db.relationship("ExpenseStatus")



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


class ExpenseStatus(db.Model):
    __tablename__ = "expense_statuses"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False) # Ej: Pendiente, Pagado
    description = db.Column(db.String(255), nullable=True)  
    is_active = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f"<ExpenseStatus {self.name}>"


class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)

    action = db.Column(db.String(100), nullable=False)
    entity = db.Column(db.String(50), nullable=False)
    entity_id = db.Column(db.Integer, nullable=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
