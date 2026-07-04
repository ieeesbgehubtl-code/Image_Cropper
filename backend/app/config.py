from functools import lru_cache
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "AI Passport Photo Generator"
    api_prefix: str = "/api"
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    base_dir: Path = Path(__file__).resolve().parents[1]
    upload_dir: Path = Field(default=Path("backend/app/uploads"))
    output_dir: Path = Field(default=Path("backend/app/outputs"))
    temp_dir: Path = Field(default=Path("backend/app/temp"))
    log_dir: Path = Field(default=Path("backend/app/logs"))
    max_image_mb: int = 10
    max_zip_mb: int = 500
    max_zip_images: int = 1000
    output_width: int = 413
    output_height: int = 531
    jpeg_quality: int = 95
    insightface_model: str = "buffalo_l"
    insightface_det_size: tuple[int, int] = (640, 640)
    background_model: str = "briaai/RMBG-2.0"
    fallback_background_model: str = "ZhengPeng7/BiRefNet"
    hf_local_files_only: bool = False
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    def ensure_dirs(self) -> None:
        for path in (self.upload_dir, self.output_dir, self.temp_dir, self.log_dir):
            path.mkdir(parents=True, exist_ok=True)

@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.ensure_dirs()
    return settings
