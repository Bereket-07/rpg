"""add author cms fields

Revision ID: b7a0d7c9b2ef
Revises: 69b37198f663
Create Date: 2026-06-08 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "b7a0d7c9b2ef"
down_revision: Union[str, None] = "69b37198f663"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE authors ADD COLUMN IF NOT EXISTS role VARCHAR")
    op.execute("ALTER TABLE authors ADD COLUMN IF NOT EXISTS beyond_therapy TEXT")
    op.execute("ALTER TABLE authors ADD COLUMN IF NOT EXISTS approach_paragraphs JSON")
    op.execute("ALTER TABLE authors ADD COLUMN IF NOT EXISTS background_paragraphs JSON")
    op.execute("ALTER TABLE authors ADD COLUMN IF NOT EXISTS specialties_list JSON")


def downgrade() -> None:
    op.execute("ALTER TABLE authors DROP COLUMN IF EXISTS specialties_list")
    op.execute("ALTER TABLE authors DROP COLUMN IF EXISTS background_paragraphs")
    op.execute("ALTER TABLE authors DROP COLUMN IF EXISTS approach_paragraphs")
    op.execute("ALTER TABLE authors DROP COLUMN IF EXISTS beyond_therapy")
    op.execute("ALTER TABLE authors DROP COLUMN IF EXISTS role")
