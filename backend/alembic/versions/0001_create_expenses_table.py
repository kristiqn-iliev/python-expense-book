"""create expenses table"""

from collections.abc import Sequence
from typing import Optional

from alembic import op
import sqlalchemy as sa

revision: str = "0001_create_expenses_table"
down_revision: Optional[str] = None
branch_labels: Optional[Sequence[str]] = None
depends_on: Optional[Sequence[str]] = None


def upgrade() -> None:
    op.create_table(
        "expenses",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_expenses_id", "expenses", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_expenses_id", table_name="expenses")
    op.drop_table("expenses")
