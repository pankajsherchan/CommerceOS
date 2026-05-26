from fastapi.testclient import TestClient


def test_catalog_categories_returns_storefront_categories(
    client: TestClient,
) -> None:
    response = client.get("/api/catalog/categories")

    assert response.status_code == 200
    categories = response.json()
    assert categories[0] == {
        "description": "Warm desk objects with tactile finishes and everyday utility.",
        "name": "Desk Objects",
        "slug": "desk-objects",
    }


def test_catalog_products_support_category_filter(client: TestClient) -> None:
    response = client.get("/api/catalog/products", params={"category": "storage"})

    assert response.status_code == 200
    products = response.json()
    assert [product["slug"] for product in products] == [
        "axis-catchall-trays",
        "draft-paper-tower",
    ]


def test_catalog_product_detail_returns_product(client: TestClient) -> None:
    response = client.get("/api/catalog/products/harbor-monitor-stand")

    assert response.status_code == 200
    assert response.json()["name"] == "Harbor Monitor Stand"


def test_catalog_product_detail_returns_404_for_unknown_slug(
    client: TestClient,
) -> None:
    response = client.get("/api/catalog/products/not-real")

    assert response.status_code == 404
    assert response.json() == {"detail": "Product not found."}
