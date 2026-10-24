"""1

Revision ID: f4a001face36
Revises: 504cbf5642ea
Create Date: 2026-10-22 13:20:25.939037

"""
from typing import Sequence, Union

import geoalchemy2
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f4a001face36'
down_revision: Union[str, Sequence[str], None] = '504cbf5642ea'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # crops
    op.create_table('crops',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        if_not_exists=True,
    )
    op.create_index(op.f('ix_crops_name'), 'crops', ['name'], unique=True, if_not_exists=True)

    # users — init_db has `upgrade: pass`, so users was never created; if_not_exists for safety
    op.create_table('users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('role', sa.Enum('USER', 'ADMIN', name='userrole', native_enum=False), nullable=False),
        sa.Column('first_name', sa.String(), nullable=True),
        sa.Column('last_name', sa.String(), nullable=True),
        sa.Column('phone_number', sa.String(), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        if_not_exists=True,
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True, if_not_exists=True)

    # fields (depends on users)
    op.create_table('fields',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),

        sa.Column('name', sa.String(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('geom', geoalchemy2.types.Geometry(
            geometry_type='POLYGON', srid=4326, dimension=2,
            from_text='ST_GeomFromEWKT', name='geometry', nullable=False,
        ), nullable=False),
        sa.Column('total_area', sa.Float(), nullable=True),
        sa.Column('region', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        if_not_exists=True,
    )
    op.create_index('idx_fields_geom', 'fields', ['geom'], unique=False, postgresql_using='gist', if_not_exists=True)

    # market_products
    op.create_table('market_products',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('crop_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['crop_id'], ['crops.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        if_not_exists=True,
    )
    op.create_index(op.f('ix_market_products_name'), 'market_products', ['name'], unique=True, if_not_exists=True)

    # plots
    op.create_table('plots',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('field_id', sa.Integer(), nullable=False),
        sa.Column('geom', geoalchemy2.types.Geometry(
            geometry_type='POLYGON', srid=4326, dimension=2,
            from_text='ST_GeomFromEWKT', name='geometry', nullable=False,
        ), nullable=False),
        sa.Column('total_area', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['field_id'], ['fields.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        if_not_exists=True,
    )
    op.create_index('idx_plots_geom', 'plots', ['geom'], unique=False, postgresql_using='gist', if_not_exists=True)

    # plot_history
    op.create_table('plot_history',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('plot_id', sa.Integer(), nullable=False),
        sa.Column('crop_id', sa.Integer(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['crop_id'], ['crops.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['plot_id'], ['plots.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        if_not_exists=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('plot_history')
    op.drop_index('idx_plots_geom', table_name='plots', postgresql_using='gist')
    op.drop_table('plots')
    op.drop_index(op.f('ix_market_products_name'), table_name='market_products')
    op.drop_table('market_products')
    op.drop_index('idx_fields_geom', table_name='fields', postgresql_using='gist')
    op.drop_table('fields')
    op.drop_index(op.f('ix_crops_name'), table_name='crops')
    op.drop_table('crops')
