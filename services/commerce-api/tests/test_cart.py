from fastapi.testclient import TestClient


def test_cart_returns_fixture_lines(client: TestClient) -> None:
    response = client.get("/api/cart")

    assert response.status_code == 200
    assert {
        "productSlug": "harbor-monitor-stand",
        "quantity": 1,
        "size": "Standard",
    } in response.json()["lines"]


def test_cart_mutation_requires_placeholder_auth(client: TestClient) -> None:
    response = client.post(
        "/api/cart/items",
        json={
            "productSlug": "harbor-monitor-stand",
            "quantity": 1,
            "size": "Standard",
        },
    )

    assert response.status_code == 401


def test_cart_mutation_validates_payload(client: TestClient) -> None:
    response = client.post(
        "/api/cart/items",
        headers={"Authorization": "Bearer placeholder"},
        json={
            "productSlug": "harbor-monitor-stand",
            "quantity": 0,
            "size": "Standard",
        },
    )

    assert response.status_code == 422


def test_cart_mutation_rejects_unknown_product(client: TestClient) -> None:
    response = client.post(
        "/api/cart/items",
        headers={"Authorization": "Bearer placeholder"},
        json={
            "productSlug": "not-real",
            "quantity": 1,
            "size": "One size",
        },
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Product not found."}


def test_cart_mutation_rejects_unavailable_size(client: TestClient) -> None:
    response = client.post(
        "/api/cart/items",
        headers={"Authorization": "Bearer placeholder"},
        json={
            "productSlug": "north-table-lamp",
            "quantity": 1,
            "size": "Wide",
        },
    )

    assert response.status_code == 422
    assert response.json() == {
        "detail": "Selected size is not available for this product.",
    }


def test_cart_mutation_adds_valid_item_with_placeholder_auth(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/cart/items",
        headers={"Authorization": "Bearer placeholder"},
        json={
            "productSlug": "north-table-lamp",
            "quantity": 1,
            "size": "One size",
        },
    )

    assert response.status_code == 200
    assert {
        "productSlug": "north-table-lamp",
        "quantity": 1,
        "size": "One size",
    } in response.json()["lines"]


def test_cart_mutation_updates_existing_item_quantity(
    client: TestClient,
) -> None:
    response = client.patch(
        "/api/cart/items",
        headers={"Authorization": "Bearer placeholder"},
        json={
            "productSlug": "harbor-monitor-stand",
            "quantity": 3,
            "size": "Standard",
        },
    )

    assert response.status_code == 200
    assert {
        "productSlug": "harbor-monitor-stand",
        "quantity": 3,
        "size": "Standard",
    } in response.json()["lines"]


def test_cart_mutation_rejects_quantity_update_for_missing_line(
    client: TestClient,
) -> None:
    response = client.patch(
        "/api/cart/items",
        headers={"Authorization": "Bearer placeholder"},
        json={
            "productSlug": "north-table-lamp",
            "quantity": 3,
            "size": "One size",
        },
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Cart item not found."}


def test_cart_mutation_removes_existing_item(
    client: TestClient,
) -> None:
    response = client.delete(
        "/api/cart/items",
        headers={"Authorization": "Bearer placeholder"},
        params={
            "productSlug": "harbor-monitor-stand",
            "size": "Standard",
        },
    )

    assert response.status_code == 200
    assert {
        "productSlug": "harbor-monitor-stand",
        "quantity": 1,
        "size": "Standard",
    } not in response.json()["lines"]


def test_cart_mutation_clears_cart(
    client: TestClient,
) -> None:
    response = client.delete(
        "/api/cart",
        headers={"Authorization": "Bearer placeholder"},
    )

    assert response.status_code == 200
    assert response.json() == {"lines": []}
