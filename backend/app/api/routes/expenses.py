from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_db_session,
    get_expense_repository,
    get_expense_service,
)
from app.repositories.expense_repository import ExpenseRepository
from app.schemas.expense import ExpenseCreate, ExpenseRead
from app.services.expense_service import ExpenseService

router = APIRouter(prefix="/expenses", tags=["expenses"])

DbSession = Annotated[Session, Depends(get_db_session)]


def get_service(db: DbSession) -> ExpenseService:
    repository: ExpenseRepository = get_expense_repository(db)
    return get_expense_service(repository)


ExpenseServiceDependency = Annotated[ExpenseService, Depends(get_service)]


@router.post("", response_model=ExpenseRead, status_code=status.HTTP_201_CREATED)
def create_expense(
    payload: ExpenseCreate,
    service: ExpenseServiceDependency,
) -> ExpenseRead:
    return service.create_expense(payload)


@router.get("", response_model=list[ExpenseRead])
def list_expenses(service: ExpenseServiceDependency) -> list[ExpenseRead]:
    return service.list_expenses()

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    service: ExpenseServiceDependency,
) -> None:
    service.delete_expense(expense_id)
