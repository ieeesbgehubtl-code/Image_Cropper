from pydantic import BaseModel, Field

class ErrorResponse(BaseModel):
    detail: str
    code: str = "PROCESSING_ERROR"

class PassportResult(BaseModel):
    original_filename: str
    output_filename: str | None = None
    download_url: str | None = None
    success: bool
    message: str
    face_count: int = 0

class BatchResponse(BaseModel):
    total: int
    succeeded: int
    failed: int
    results: list[PassportResult]
    zip_download_url: str | None = None

class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    device: str
