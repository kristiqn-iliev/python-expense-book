"""add expense details fields"""

from collections.abc import Sequence
from typing import Optional

from alembic import op
import sqlalchemy as sa

revision: str = "0002_add_expense_details"
down_revision: Optional[str] = "0001_create_expenses_table"
branch_labels: Optional[Sequence[str]] = None
depends_on: Optional[Sequence[str]] = None


def upgrade() -> None:
    op.add_column(
        "expenses",
        sa.Column(
            "purchase_date",
            sa.Date(),
            nullable=False,
            server_default=sa.text("CURRENT_DATE"),
        ),
    )
    op.add_column(
        "expenses",
        sa.Column(
            "category",
            sa.String(length=100),
            nullable=False,
            server_default="Uncategorized",
        ),
    )
    op.add_column(
        "expenses",
        sa.Column(
            "merchant",
            sa.String(length=255),
            nullable=False,
            server_default="Unknown",
        ),
    )
    op.add_column(
        "expenses",
        sa.Column(
            "notes",
            sa.Text(),
            nullable=False,
            server_default="",
        ),
    )
    op.add_column(
        "expenses",
        sa.Column(
            "is_recurring",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    op.alter_column("expenses", "purchase_date", server_default=None)
    op.alter_column("expenses", "category", server_default=None)
    op.alter_column("expenses", "merchant", server_default=None)
    op.alter_column("expenses", "notes", server_default=None)
    op.alter_column("expenses", "is_recurring", server_default=None)


def downgrade() -> None:
    op.drop_column("expenses", "is_recurring")
    op.drop_column("expenses", "notes")
    op.drop_column("expenses", "merchant")
    op.drop_column("expenses", "category")
    op.drop_column("expenses", "purchase_date")
