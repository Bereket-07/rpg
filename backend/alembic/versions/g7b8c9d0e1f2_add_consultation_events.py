"""add consultation events

Revision ID: g7b8c9d0e1f2
Revises: f6a7b8c9d0e1
Create Date: 2026-06-12 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "g7b8c9d0e1f2"
down_revision: Union[str, None] = "f6a7b8c9d0e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "consultation_events",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("target_type", sa.String(), nullable=False),
        sa.Column("target_id", sa.Integer(), nullable=False),
        sa.Column("event_type", sa.String(), nullable=False),
        sa.Column("actor_id", sa.Integer(), nullable=True),
        sa.Column("actor_label", sa.String(), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("event_metadata", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("ix_consultation_events_target_type", "consultation_events", ["target_type"])
    op.create_index("ix_consultation_events_target_id", "consultation_events", ["target_id"])
    op.create_index(
        "ix_consultation_events_target_lookup",
        "consultation_events",
        ["target_type", "target_id", "created_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_consultation_events_target_lookup", table_name="consultation_events")
    op.drop_index("ix_consultation_events_target_id", table_name="consultation_events")
    op.drop_index("ix_consultation_events_target_type", table_name="consultation_events")
    op.drop_table("consultation_events")
