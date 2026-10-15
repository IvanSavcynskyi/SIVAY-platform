"""create crops and market prices tables

Revision ID: 95f641905cd7
Revises: bad71b4a8e1e
Create Date: 2026-10-15 14:39:42.532330

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '95f641905cd7'
down_revision: Union[str, Sequence[str], None] = 'bad71b4a8e1e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'crops',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_crops_name'), 'crops', ['name'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_crops_name'), table_name='crops')
    op.drop_table('crops')
