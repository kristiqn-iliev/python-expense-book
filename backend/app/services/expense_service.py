from fastapi import HTTPException, status

from app.repositories.expense_repository import ExpenseRepository
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


class ExpenseService:
    def __init__(self, repository: ExpenseRepository) -> None:
        self.repository = repository

    def create_expense(self, payload: ExpenseCreate):
        return self.repository.create(payload)

    def list_expenses(self):
        return self.repository.list()
    
    def delete_expense(self, expense_id : int):
        expense = self.repository.get_by_id(expense_id)

        if expense is None :
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found",
            )

        self.repository.delete(expense)

    def edit_expense(self, expense_id : int, payload : ExpenseUpdate):
        expense = self.repository.get_by_id(expense_id)

        if expense is None : 
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found",
            )
        
        edited_expense = self.repository.edit(expense, payload)
        return edited_expense

