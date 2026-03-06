from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Momo (FITSai-Core)"
    PORT: int = 9000
    VERSION: str = "2.1.7"
    API_V1_STR: str = "/api/v1"
    
    # Database
    POSTGRES_USER: str = "momo_user"
    POSTGRES_PASSWORD: str = "momo_pass_2026"
    POSTGRES_DB: str = "momo_db"
    POSTGRES_HOST: str = "localhost"
    ASYNC_DATABASE_URL: str = "postgresql+asyncpg://momo_user:momo_pass_2026@localhost:5432/momo_db"

    # Auth
    SECRET_KEY: str = "8a49fff39bb2aa1a2e2e8245cccced4bc665ec172bfe00f8fc94dc0cb0c48d41"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # AI
    OPENAI_API_KEY: str
    ASSEMBLYAI_API_KEY: Optional[str] = None
    
    # Ollama
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_CHAT_MODEL: str = "llama3.1:8b"
    OLLAMA_CODE_MODEL: str = "deepseek-coder-v2:lite"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

settings = Settings()
