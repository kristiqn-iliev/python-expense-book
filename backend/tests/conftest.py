from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.routes.expenses import get_service
from app.db.base import Base
from app.main import app
from app.repositories.expense_repository import ExpenseRepository
from app.services.expense_service import ExpenseService


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, expire_on_commit=False)

    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_service() -> ExpenseService:
        repository = ExpenseRepository(db_session)
        return ExpenseService(repository)

    app.dependency_overrides[get_service] = override_service

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
