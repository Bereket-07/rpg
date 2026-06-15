"""add author availability fields

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-06-12 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "f6a7b8c9d0e1"
down_revision: Union[str, None] = "e5f6a7b8c9d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE authors ADD COLUMN IF NOT EXISTS accepting_new_clients BOOLEAN NOT NULL DEFAULT TRUE")
    op.execute("ALTER TABLE authors ADD COLUMN IF NOT EXISTS availability_timezone VARCHAR DEFAULT 'America/Los_Angeles'")
    op.execute("ALTER TABLE authors ADD COLUMN IF NOT EXISTS available_weekdays JSON DEFAULT '[1,2,3,4,5]'")
    op.execute("ALTER TABLE authors ADD COLUMN IF NOT EXISTS consultation_modes JSON DEFAULT '[\"Telehealth\"]'")
    op.execute("ALTER TABLE authors ADD COLUMN IF NOT EXISTS intake_note TEXT")


def downgrade() -> None:
    op.execute("ALTER TABLE authors DROP COLUMN IF EXISTS intake_note")
    op.execute("ALTER TABLE authors DROP COLUMN IF EXISTS consultation_modes")
    op.execute("ALTER TABLE authors DROP COLUMN IF EXISTS available_weekdays")
    op.execute("ALTER TABLE authors DROP COLUMN IF EXISTS availability_timezone")
    op.execute("ALTER TABLE authors DROP COLUMN IF EXISTS accepting_new_clients")
