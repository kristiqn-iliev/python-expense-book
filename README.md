# Expense Book Starter

Minimal, runnable full-stack starter template for an expense-book project.

This repository is intentionally small. It demonstrates a clean Python backend architecture, a tiny React frontend, and basic DevOps setup without pretending to be a finished product.

## Stack

- Backend: FastAPI, SQLAlchemy, Alembic, Pydantic, PostgreSQL, Pytest
- Frontend: React, TypeScript, Vite
- DevOps: Docker, Docker Compose, GitHub Actions

## Project Tree

```text
.
|-- .env.example
|-- .github/
|   `-- workflows/
|       `-- backend-tests.yml
|-- .gitignore
|-- README.md
|-- docker-compose.yml
|-- backend/
|   |-- Dockerfile
|   |-- alembic.ini
|   |-- requirements.txt
|   |-- alembic/
|   |   |-- env.py
|   |   |-- script.py.mako
|   |   `-- versions/
|   |       `-- 0001_create_expenses_table.py
|   |-- app/
|   |   |-- __init__.py
|   |   |-- main.py
|   |   |-- api/
|   |   |   |-- __init__.py
|   |   |   |-- dependencies.py
|   |   |   `-- routes/
|   |   |       |-- __init__.py
|   |   |       `-- expenses.py
|   |   |-- core/
|   |   |   |-- __init__.py
|   |   |   `-- config.py
|   |   |-- db/
|   |   |   |-- __init__.py
|   |   |   |-- base.py
|   |   |   `-- session.py
|   |   |-- ml/
|   |   |   `-- __init__.py
|   |   |-- models/
|   |   |   |-- __init__.py
|   |   |   `-- expense.py
|   |   |-- repositories/
|   |   |   |-- __init__.py
|   |   |   `-- expense_repository.py
|   |   |-- schemas/
|   |   |   |-- __init__.py
|   |   |   `-- expense.py
|   |   `-- services/
|   |       |-- __init__.py
|   |       `-- expense_service.py
|   `-- tests/
|       |-- conftest.py
|       `-- test_expenses.py
`-- frontend/
    |-- Dockerfile
    |-- index.html
    |-- package.json
    |-- tsconfig.json
    |-- tsconfig.node.json
    |-- vite.config.ts
    `-- src/
        |-- App.tsx
        |-- main.tsx
        |-- styles.css
        |-- vite-env.d.ts
        |-- api/
        |   `-- client.ts
        |-- components/
        |   |-- ExpenseForm.tsx
        |   `-- ExpenseList.tsx
        `-- pages/
            `-- ExpensesPage.tsx
```

## Architecture Overview

The backend follows a simple layered flow:

1. Route handlers receive HTTP requests and return HTTP responses.
2. Services contain business rules and orchestrate use cases.
3. Repositories handle database access only.
4. Schemas define request and response DTOs.
5. Models define SQLAlchemy ORM entities.

That separation keeps the code easy to test and easy to grow without mixing concerns too early.

## Sample Feature Included

Only one tiny feature is implemented:

- `POST /api/v1/expenses`
- `GET /api/v1/expenses`

This is enough to demonstrate the architecture without turning the starter into a completed app.

## Local Setup

### Option 1: Docker Compose

1. Copy `.env.example` to `.env`.
2. Run:

```bash
docker compose up --build
```

3. Open:

- Frontend: `http://localhost:5173`
- Backend docs: `http://localhost:8000/api/v1/docs`

### Option 2: Run Services Manually

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

This assumes you have a local PostgreSQL instance matching the values in the root `.env`.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Testing

Backend tests are intentionally lightweight and use SQLite in memory:

```bash
cd backend
pytest
```

## Where To Start Coding Next

When you begin building real features, these are the first places to edit:

- `backend/app/models/expense.py` when the database entity changes
- `backend/app/schemas/expense.py` when request or response shapes change
- `backend/app/repositories/expense_repository.py` for new queries
- `backend/app/services/expense_service.py` for business logic
- `backend/app/api/routes/expenses.py` when exposing new endpoints
- `frontend/src/api/client.ts` when the frontend needs new API calls
- `frontend/src/pages/ExpensesPage.tsx` when you want to evolve the UI flow

## Notes

- `app/ml` is only a placeholder package for future work.
- The current frontend is deliberately tiny and only proves the wiring.
- The current CI workflow runs backend tests only, which is a good minimal starting point.
