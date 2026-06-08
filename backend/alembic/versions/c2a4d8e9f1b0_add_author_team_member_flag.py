"""add author team member flag

Revision ID: c2a4d8e9f1b0
Revises: b7a0d7c9b2ef
Create Date: 2026-06-08 23:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "c2a4d8e9f1b0"
down_revision: Union[str, None] = "b7a0d7c9b2ef"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


DEFAULT_TEAM_NAMES = (
    "Anat Cohen, Ph.D.",
    "Tamara Eromo, Psy.D.",
    "Wendy Eifert, Psy.D.",
    "Hedieh Hakakian, Psy.D.",
    "Valarie Gardner, M.A., AMFT",
)


def upgrade() -> None:
    op.execute("ALTER TABLE authors ADD COLUMN IF NOT EXISTS is_team_member BOOLEAN NOT NULL DEFAULT FALSE")
    names = ", ".join("'" + name.replace("'", "''") + "'" for name in DEFAULT_TEAM_NAMES)
    op.execute(f"UPDATE authors SET is_team_member = TRUE WHERE name IN ({names})")


def downgrade() -> None:
    op.execute("ALTER TABLE authors DROP COLUMN IF EXISTS is_team_member")
