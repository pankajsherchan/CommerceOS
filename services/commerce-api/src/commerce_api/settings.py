from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    allowed_origins: list[str]


def get_settings() -> Settings:
    raw_origins = os.getenv(
        "COMMERCE_API_ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:3001",
    )
    allowed_origins = [
        origin.strip() for origin in raw_origins.split(",") if origin.strip()
    ]

    return Settings(allowed_origins=allowed_origins)
