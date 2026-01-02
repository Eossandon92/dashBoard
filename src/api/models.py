from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import (
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Table,
    Column,
    Integer
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
