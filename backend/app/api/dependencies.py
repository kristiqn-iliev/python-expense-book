from collections.abc import Generator

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.repositories.expense_repository import ExpenseRepository
from app.services.expense_service import ExpenseService


def get_db_session() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_expense_repository(db: Session) -> ExpenseRepository:
    return ExpenseRepository(db)


def get_expense_service(repository: ExpenseRepository) -> ExpenseService:
    return ExpenseService(repository)
