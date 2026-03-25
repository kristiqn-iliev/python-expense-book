from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ExpenseCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    amount: Decimal = Field(gt=0, decimal_places=2, max_digits=10)
    purchase_date: date
    category: str = Field(min_length=1, max_length=100)
    merchant: str = Field(min_length=1, max_length=255)
    notes: str = ""
    is_recurring: bool = False


class ExpenseUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    amount: Optional[Decimal] = Field(
        default=None,
        gt=0,
        decimal_places=2,
        max_digits=10,
    )
    purchase_date: Optional[date] = None
    category: Optional[str] = Field(default=None, min_length=1, max_length=100)
    merchant: Optional[str] = Field(default=None, min_length=1, max_length=255)
    notes: Optional[str] = None
    is_recurring: Optional[bool] = None


class ExpenseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    amount: Decimal
    purchase_date: date
    category: str
    merchant: str
    notes: str
    is_recurring: bool
    created_at: datetime
