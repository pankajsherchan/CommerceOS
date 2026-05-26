import pytest
from fastapi.testclient import TestClient

from commerce_api.cart.repository import cart_repository
from commerce_api.main import create_app


@pytest.fixture
def client() -> TestClient:
    cart_repository.reset()
    return TestClient(create_app())
