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
