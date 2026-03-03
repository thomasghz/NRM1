from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://nrm_user:nrm_pass@localhost:5432/nrm_db"
    SECRET_KEY: str = "change-this-in-production"
    DEBUG: bool = True

    class Config:
        env_file = ".env"


settings = Settings()
