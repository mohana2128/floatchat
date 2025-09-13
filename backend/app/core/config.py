from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "FloatChat API"
    mongodb_url: str = "mongodb+srv://mohanag_db_user:60MDhUAmz93ZOMrj@cluster0.wlygi49.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    mongodb_db_name: str = "floatchat"
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # External API configurations
    incois_api_base: str = "https://incois.gov.in/OON/api"
    noaa_api_base: str = "https://floats.pmel.noaa.gov/api"
    ifremer_ftp_base: str = "ftp://ftp.ifremer.fr/ifremer/argo"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()