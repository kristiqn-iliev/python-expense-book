from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.auth import UserRegister


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, payload: UserRegister, hashed_password: str) -> User:
        user = User(
            email=payload.email,
            username=payload.username,
            hashed_password=hashed_password,
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_by_id(self, user_id: int) -> Optional[User]:
        statement = select(User).where(User.id == user_id)
        return self.db.scalar(statement)

    def get_by_email(self, email: str) -> Optional[User]:
        statement = select(User).where(User.email == email)
        return self.db.scalar(statement)

    def get_by_username(self, username: str) -> Optional[User]:
        statement = select(User).where(User.username == username)
        return self.db.scalar(statement)
