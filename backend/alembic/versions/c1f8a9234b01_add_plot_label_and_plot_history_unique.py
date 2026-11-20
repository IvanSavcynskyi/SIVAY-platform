"""add_plot_label_and_plot_history_unique

Revision ID: c1f8a9234b01
Revises: f4a001face36
Create Date: 2026-11-20 21:51:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1f8a9234b01'
down_revision: Union[str, Sequence[str], None] = 'f4a001face36'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Додавання поля label до таблиці plots
    op.add_column('plots', sa.Column('label', sa.String(), nullable=True))

    # Додавання унікального обмеження (plot_id, year) до таблиці plot_history
    op.create_unique_constraint(
        'uq_plot_history_plot_id_year',
        'plot_history',
        ['plot_id', 'year']
    )


def downgrade() -> None:
    op.drop_constraint('uq_plot_history_plot_id_year', 'plot_history', type_='unique')
    op.drop_column('plots', 'label')

