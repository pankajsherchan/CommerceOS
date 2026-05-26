from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    allowed_origins: list[str]
    database_url: str


def get_settings() -> Settings:
    raw_origins = os.getenv(
        "COMMERCE_API_ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:3001",
    )
    allowed_origins = [
        origin.strip() for origin in raw_origins.split(",") if origin.strip()
    ]
    database_url = os.getenv(
        "COMMERCE_API_DATABASE_URL",
        "postgresql+psycopg://commerce_os:commerce_os@localhost:5432/commerce_os",
    )

    return Settings(allowed_origins=allowed_origins, database_url=database_url)
