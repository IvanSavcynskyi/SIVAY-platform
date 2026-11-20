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

    # Existing databases may contain more than one row for a (plot_id, year)
    # pair.  Keep the newest row so the unique constraint can be created.
    op.execute(sa.text(
        """
        DELETE FROM plot_history
        WHERE id IN (
            SELECT id
            FROM (
                SELECT id,
                       ROW_NUMBER() OVER (
                           PARTITION BY plot_id, year
                           ORDER BY id DESC
                       ) AS duplicate_rank
                FROM plot_history
            ) ranked_duplicates
            WHERE duplicate_rank > 1
        )
        """
    ))

    # Додавання унікального обмеження (plot_id, year) до таблиці plot_history
    op.create_unique_constraint(
        'uq_plot_history_plot_id_year',
        'plot_history',
        ['plot_id', 'year']
    )


def downgrade() -> None:
    op.drop_constraint('uq_plot_history_plot_id_year', 'plot_history', type_='unique')
    op.drop_column('plots', 'label')
