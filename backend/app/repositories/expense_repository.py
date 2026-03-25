from typing import Optional

from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate
from app.schemas.expense import ExpenseUpdate
from sqlalchemy import select
from sqlalchemy.orm import Session


class ExpenseRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, payload: ExpenseCreate) -> Expense:
        expense = Expense(
            title=payload.title,
            amount=payload.amount,
            purchase_date=payload.purchase_date,
            category=payload.category,
            merchant=payload.merchant,
            notes=payload.notes,
            is_recurring=payload.is_recurring,
        )
        self.db.add(expense)
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def list(self) -> list[Expense]:
        statement = select(Expense).order_by(Expense.created_at.desc(), Expense.id.desc())
        return list(self.db.scalars(statement).all())
    
    def get_by_id(self, expense_id : int) -> Optional[Expense]:
        expense = self.db.query(Expense).filter(Expense.id == expense_id).first()
        return expense
    
    def delete(self, expense : Expense) -> None:
        self.db.delete(expense)
        self.db.commit()

    def edit(self, expense: Expense, payload: ExpenseUpdate) -> Expense:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(expense,field,value)
            
        self.db.commit()
        self.db.refresh(expense)
        return expense
