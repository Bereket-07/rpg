"""extend consultation workflow

Revision ID: e5f6a7b8c9d0
Revises: d4b9a7c2e6f1
Create Date: 2026-06-10 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "e5f6a7b8c9d0"
down_revision: Union[str, None] = "d4b9a7c2e6f1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bookingstatus') THEN
                ALTER TYPE bookingstatus ADD VALUE IF NOT EXISTS 'reviewing';
                ALTER TYPE bookingstatus ADD VALUE IF NOT EXISTS 'assigned_to_clinician';
                ALTER TYPE bookingstatus ADD VALUE IF NOT EXISTS 'awaiting_client';
                ALTER TYPE bookingstatus ADD VALUE IF NOT EXISTS 'waitlisted';
                ALTER TYPE bookingstatus ADD VALUE IF NOT EXISTS 'completed';
            END IF;
        END
        $$;
        """
    )

    op.execute("ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS admin_notes TEXT")
    op.execute("ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS assigned_author_id INTEGER")
    op.execute("ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT")
    op.execute("ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS video_link VARCHAR")
    op.execute("ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP")
    op.execute("ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS declined_at TIMESTAMP")
    op.execute("ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS last_notified_at TIMESTAMP")


def downgrade() -> None:
    op.execute("ALTER TABLE booking_requests DROP COLUMN IF EXISTS last_notified_at")
    op.execute("ALTER TABLE booking_requests DROP COLUMN IF EXISTS declined_at")
    op.execute("ALTER TABLE booking_requests DROP COLUMN IF EXISTS confirmed_at")
    op.execute("ALTER TABLE booking_requests DROP COLUMN IF EXISTS video_link")
    op.execute("ALTER TABLE booking_requests DROP COLUMN IF EXISTS admin_notes")
    op.execute("ALTER TABLE booking_requests DROP COLUMN IF EXISTS assigned_author_id")
    op.execute("ALTER TABLE contact_inquiries DROP COLUMN IF EXISTS admin_notes")
