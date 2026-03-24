from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate
from sqlalchemy import select
from sqlalchemy.orm import Session


class ExpenseRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, payload: ExpenseCreate) -> Expense:
        expense = Expense(title=payload.title, amount=payload.amount)
        self.db.add(expense)
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def list(self) -> list[Expense]:
        statement = select(Expense).order_by(Expense.created_at.desc(), Expense.id.desc())
        return list(self.db.scalars(statement).all())
    
    def get_by_id(self, expense_id : int) -> Expense | None:
        expense = self.db.query(Expense).filter(Expense.id == expense_id).first()
        return expense
    
    def delete(self, expense : Expense) -> None:
        self.db.delete(expense)
        self.db.commit()
