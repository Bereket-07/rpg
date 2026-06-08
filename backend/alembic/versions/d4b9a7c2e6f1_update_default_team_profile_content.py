"""update default team profile content

Revision ID: d4b9a7c2e6f1
Revises: c2a4d8e9f1b0
Create Date: 2026-06-09 10:00:00.000000

"""
import json
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

from app.core.default_authors import DEFAULT_AUTHORS


# revision identifiers, used by Alembic.
revision: str = "d4b9a7c2e6f1"
down_revision: Union[str, None] = "c2a4d8e9f1b0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    connection = op.get_bind()
    statement = sa.text(
        """
        UPDATE authors
        SET role = :role,
            credentials = :credentials,
            beyond_therapy = :beyond_therapy,
            approach_paragraphs = CAST(:approach_paragraphs AS JSON),
            background_paragraphs = CAST(:background_paragraphs AS JSON),
            specialties_list = CAST(:specialties_list AS JSON),
            is_team_member = TRUE
        WHERE name = :name
        """
    )
    for author in DEFAULT_AUTHORS:
        connection.execute(
            statement,
            {
                "name": author["name"],
                "role": author["role"],
                "credentials": author["credentials"],
                "beyond_therapy": author["beyond_therapy"],
                "approach_paragraphs": json.dumps(author["approach_paragraphs"]),
                "background_paragraphs": json.dumps(author["background_paragraphs"]),
                "specialties_list": json.dumps(author["specialties_list"]),
            },
        )


def downgrade() -> None:
    pass
