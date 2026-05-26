from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from commerce_api.db import get_db_session, make_engine
from commerce_api.main import create_app
from commerce_api.models import Base
from commerce_api.seed import seed_starter_data


@pytest.fixture
def client(tmp_path) -> Iterator[TestClient]:
    engine = make_engine(f"sqlite+pysqlite:///{tmp_path}/commerce_api_test.db")
    testing_session = sessionmaker(
        bind=engine,
        autoflush=False,
        expire_on_commit=False,
    )
    Base.metadata.create_all(engine)

    with testing_session() as session:
        seed_starter_data(session)
        session.commit()

    def override_get_db_session() -> Iterator[Session]:
        with testing_session() as session:
            try:
                yield session
                session.commit()
            except Exception:
                session.rollback()
                raise

    app = create_app()
    app.dependency_overrides[get_db_session] = override_get_db_session

    with TestClient(app) as test_client:
        yield test_client

    engine.dispose()
