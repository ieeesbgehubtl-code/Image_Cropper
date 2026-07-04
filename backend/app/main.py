from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from app.api.passport import router
from app.config import get_settings
from app.dependencies import background_remover, face_detector
from app.schemas.passport import HealthResponse
settings = get_settings(); logger.add(settings.log_dir / "app.log", rotation="10 MB", retention="14 days")
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting {}", settings.app_name); face_detector.load(); background_remover.load(); yield; logger.info("Shutdown complete")
app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(router)
@app.get("/")
def root(): return {"name": settings.app_name, "docs": "/docs"}
@app.get("/health", response_model=HealthResponse)
def health(): return HealthResponse(status="ok", models_loaded=face_detector.app is not None and background_remover.model is not None, device=background_remover.device)
