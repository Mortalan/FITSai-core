from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Momo (FITSai-Core)"
    PORT: int = 9000
    VERSION: str = "1.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    POSTGRES_USER: str = "momo_user"
    POSTGRES_PASSWORD: str = "momo_pass_2026"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "momo_db"
    
    @property
    def ASYNC_DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # JWT
    SECRET_KEY: str = "8a49fff39bb2aa1a2e2e8245cccced4bc665ec172bfe00f8fc94dc0cb0c48d41" # Temporary
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week

    # AI
    OPENAI_API_KEY: str = "sk-proj-..." # Will be set in .env

    class Config:
        env_file = ".env"

settings = Settings()
