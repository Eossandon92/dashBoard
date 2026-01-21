"""sincronizar tabla maintenance

Revision ID: f02b4278ffed
Revises: 2a73f19219b9
Create Date: 2026-01-21 15:54:37.448271

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f02b4278ffed'
down_revision = '2a73f19219b9'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Agregamos la columna permitiendo nulos (nullable=True) para que Postgres no reclame
    with op.batch_alter_table('maintenances', schema=None) as batch_op:
        batch_op.add_column(sa.Column('maintenance_status_id', sa.Integer(), nullable=True))

    # 2. Llenamos los datos existentes. Le ponemos el ID 1 (que es 'Pendiente' en tu tabla de estados)
    op.execute("UPDATE maintenances SET maintenance_status_id = 1")

    # 3. Ahora que todos tienen un valor, aplicamos el NOT NULL, la relación (FK) y borramos la columna vieja
    with op.batch_alter_table('maintenances', schema=None) as batch_op:
        batch_op.alter_column('maintenance_status_id', nullable=False)
        batch_op.create_foreign_key('fk_maintenance_status', 'expense_statuses', ['maintenance_status_id'], ['id'])
        batch_op.drop_column('status')


def downgrade():
    with op.batch_alter_table('maintenances', schema=None) as batch_op:
        batch_op.add_column(sa.Column('status', sa.VARCHAR(length=50), nullable=True))
        batch_op.drop_constraint('fk_maintenance_status', type_='foreignkey')
        batch_op.drop_column('maintenance_status_id')
