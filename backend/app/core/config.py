import ssl
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    # --- Project ---
    PROJECT_NAME: str = "SIVAY Platform"

    # --- PostgreSQL ---
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "sivay_db"
    POSTGRES_SSL_MODE: Literal["disable", "require", "verify-full"] = "disable"
    POSTGRES_SSL_ROOT_CERT: str | None = None
    SQL_ECHO: bool = False

    # --- Security (JWT) ---
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def ASYNC_DATABASE_URL(self) -> URL:
        # Keep credentials as URL components; passwords may contain @, / or %.
        return URL.create(
            "postgresql+asyncpg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            database=self.POSTGRES_DB,
        )

    @property
    def DATABASE_CONNECT_ARGS(self) -> dict:
        if self.POSTGRES_SSL_MODE == "disable":
            return {"ssl": False}
        context = ssl.create_default_context(cafile=self.POSTGRES_SSL_ROOT_CERT)
        if self.POSTGRES_SSL_MODE == "require":
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
        return {"ssl": context}


settings = Settings()
