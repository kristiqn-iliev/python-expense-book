from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    app_name: str = "Expense Book API"
    api_prefix: str = "/api/v1"
    database_url: str = Field(
        default="postgresql+psycopg://expensebook:expensebook@localhost:5432/expensebook"
    )
    cors_origins: list[str] = ["http://localhost:5173"]


settings = Settings()
