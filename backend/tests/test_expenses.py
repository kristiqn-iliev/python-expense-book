from decimal import Decimal


def test_create_expense(client) -> None:
    response = client.post(
        "/api/v1/expenses",
        json={"title": "Coffee", "amount": "4.50"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Coffee"
    assert Decimal(data["amount"]) == Decimal("4.50")
    assert "id" in data
    assert "created_at" in data


def test_list_expenses(client) -> None:
    client.post("/api/v1/expenses", json={"title": "Lunch", "amount": "12.00"})
    client.post("/api/v1/expenses", json={"title": "Train", "amount": "2.90"})

    response = client.get("/api/v1/expenses")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert {item["title"] for item in data} == {"Lunch", "Train"}


def test_delete_expense(client) -> None:
    create_response = client.post(
        "/api/v1/expenses",
        json={"title": "Coffee", "amount": "4.50"},
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
        json={"title": "Coffee", "amount": "4.50"},
    )
    expense_id = create_response.json()["id"]

    update_response = client.patch(
        f"/api/v1/expenses/{expense_id}",
        json={"title": "Tea", "amount": "5.20"},
    )

    assert update_response.status_code == 200
    data = update_response.json()
    assert data["id"] == expense_id
    assert data["title"] == "Tea"
    assert Decimal(data["amount"]) == Decimal("5.20")
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
        json={"title": "Coffee", "amount": "4.50"},
    )
    expense_id = create_response.json()["id"]

    update_response = client.patch(
        f"/api/v1/expenses/{expense_id}",
        json={"title": "Espresso"},
    )

    assert update_response.status_code == 200
    data = update_response.json()
    assert data["id"] == expense_id
    assert data["title"] == "Espresso"
    assert Decimal(data["amount"]) == Decimal("4.50")
    assert "created_at" in data
