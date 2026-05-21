from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://chud:chud_dev_pw@localhost:5433/chud"
    redis_url: str = "redis://localhost:6380/0"
    jwt_secret: str = "dev_only_jwt_secret_change_me"
    jwt_algorithm: str = "HS256"
    jwt_expiry_minutes: int = 60 * 24 * 30  # 30 days
    environment: str = "dev"

    class Config:
        env_file = ".env"


settings = Settings()
