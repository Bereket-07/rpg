"""add clinician blocked slots
Revision ID: h8c9d0e1f2g3
Revises: g7b8c9d0e1f2
Create Date: 2026-06-16
"""
from alembic import op
import sqlalchemy as sa

revision = 'h8c9d0e1f2g3'
down_revision = 'g7b8c9d0e1f2'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'clinician_blocked_slots',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('author_id', sa.Integer(), sa.ForeignKey('authors.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('blocked_date', sa.String(10), nullable=False),   # YYYY-MM-DD
        sa.Column('start_time', sa.String(8), nullable=True),       # HH:MM AM/PM or null
        sa.Column('end_time', sa.String(8), nullable=True),
        sa.Column('is_full_day', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('reason', sa.String(200), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()')),
    )


def downgrade():
    op.drop_table('clinician_blocked_slots')
