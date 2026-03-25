from decimal import Decimal


def test_create_expense(client) -> None:
    response = client.post(
        "/api/v1/expenses",
        json={
            "title": "Coffee",
            "amount": "4.50",
            "purchase_date": "2026-03-25",
            "category": "Food",
            "merchant": "Cafe Central",
            "notes": "Morning coffee",
            "is_recurring": False,
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Coffee"
    assert Decimal(data["amount"]) == Decimal("4.50")
    assert data["purchase_date"] == "2026-03-25"
    assert data["category"] == "Food"
    assert data["merchant"] == "Cafe Central"
    assert data["notes"] == "Morning coffee"
    assert data["is_recurring"] is False
    assert "id" in data
    assert "created_at" in data


def test_list_expenses(client) -> None:
    client.post(
        "/api/v1/expenses",
        json={
            "title": "Lunch",
            "amount": "12.00",
            "purchase_date": "2026-03-24",
            "category": "Food",
            "merchant": "Bistro",
            "notes": "",
            "is_recurring": False,
        },
    )
    client.post(
        "/api/v1/expenses",
        json={
            "title": "Train",
            "amount": "2.90",
            "purchase_date": "2026-03-23",
            "category": "Transport",
            "merchant": "City Rail",
            "notes": "One-way ticket",
            "is_recurring": False,
        },
    )

    response = client.get("/api/v1/expenses")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert {item["title"] for item in data} == {"Lunch", "Train"}


def test_delete_expense(client) -> None:
    create_response = client.post(
        "/api/v1/expenses",
        json={
            "title": "Coffee",
            "amount": "4.50",
            "purchase_date": "2026-03-25",
            "category": "Food",
            "merchant": "Cafe Central",
            "notes": "",
            "is_recurring": False,
        },
    )
    expense_id = create_response.json()["id"]

    delete_response = client.delete(f"/api/v1/expenses/{expense_id}")

    assert delete_response.status_code == 204

    list_response = client.get("/api/v1/expenses")
    assert list_response.status_code == 200
    assert list_response.json() == []


def test_edit_expense(client) -> None:
    create_response = client.post(
        "/api/v1/expenses",
        json={
            "title": "Coffee",
            "amount": "4.50",
            "purchase_date": "2026-03-25",
            "category": "Food",
            "merchant": "Cafe Central",
            "notes": "",
            "is_recurring": False,
        },
    )
    expense_id = create_response.json()["id"]

    update_response = client.patch(
        f"/api/v1/expenses/{expense_id}",
        json={
            "title": "Tea",
            "amount": "5.20",
            "purchase_date": "2026-03-26",
            "category": "Groceries",
            "merchant": "Market Hall",
            "notes": "Afternoon tea",
            "is_recurring": True,
        },
    )

    assert update_response.status_code == 200
    data = update_response.json()
    assert data["id"] == expense_id
    assert data["title"] == "Tea"
    assert Decimal(data["amount"]) == Decimal("5.20")
    assert data["purchase_date"] == "2026-03-26"
    assert data["category"] == "Groceries"
    assert data["merchant"] == "Market Hall"
    assert data["notes"] == "Afternoon tea"
    assert data["is_recurring"] is True
    assert "created_at" in data


def test_edit_expense_returns_404_when_missing(client) -> None:
    response = client.patch(
        "/api/v1/expenses/9999",
        json={"title": "Tea"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Expense not found"


def test_edit_expense_updates_only_provided_fields(client) -> None:
    create_response = client.post(
        "/api/v1/expenses",
        json={
            "title": "Coffee",
            "amount": "4.50",
            "purchase_date": "2026-03-25",
            "category": "Food",
            "merchant": "Cafe Central",
            "notes": "Morning coffee",
            "is_recurring": False,
        },
    )
    expense_id = create_response.json()["id"]

    update_response = client.patch(
        f"/api/v1/expenses/{expense_id}",
        json={"category": "Beverages", "is_recurring": True},
    )

    assert update_response.status_code == 200
    data = update_response.json()
    assert data["id"] == expense_id
    assert data["title"] == "Coffee"
    assert Decimal(data["amount"]) == Decimal("4.50")
    assert data["purchase_date"] == "2026-03-25"
    assert data["category"] == "Beverages"
    assert data["merchant"] == "Cafe Central"
    assert data["notes"] == "Morning coffee"
    assert data["is_recurring"] is True
    assert "created_at" in data
