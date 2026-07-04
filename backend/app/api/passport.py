from pathlib import Path
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from app.config import Settings, get_settings
from app.dependencies import get_passport_service
from app.schemas.passport import BatchResponse, PassportResult
from app.services.passport import PassportImageService
from app.utils.files import save_upload
router = APIRouter(prefix="/api", tags=["passport"])
@router.post("/passport/single", response_model=PassportResult)
async def single(file: UploadFile = File(...), background: str = Form("#FFFFFF"), svc: PassportImageService = Depends(get_passport_service), settings: Settings = Depends(get_settings)):
    try: path = await save_upload(file, settings.upload_dir, settings); return await __import__('asyncio').to_thread(svc.process_image, path, background)
    except ValueError as exc: raise HTTPException(400, {"code":"VALIDATION_ERROR","message":str(exc)})
@router.post("/passport/multiple", response_model=BatchResponse)
async def multiple(files: list[UploadFile] = File(...), background: str = Form("#FFFFFF"), svc: PassportImageService = Depends(get_passport_service), settings: Settings = Depends(get_settings)):
    try:
        paths = [await save_upload(f, settings.upload_dir, settings) for f in files]
        return await __import__('asyncio').to_thread(svc.process_many, paths, background)
    except ValueError as exc: raise HTTPException(400, {"code":"VALIDATION_ERROR","message":str(exc)})
@router.post("/passport/zip", response_model=BatchResponse)
async def zip_upload(file: UploadFile = File(...), background: str = Form("#FFFFFF"), svc: PassportImageService = Depends(get_passport_service), settings: Settings = Depends(get_settings)):
    try: path = await save_upload(file, settings.upload_dir, settings, zip_allowed=True); return await __import__('asyncio').to_thread(svc.process_zip, path, background)
    except ValueError as exc: raise HTTPException(400, {"code":"VALIDATION_ERROR","message":str(exc)})
@router.get("/download/all")
def download_all(settings: Settings = Depends(get_settings)):
    path = settings.output_dir / "passport_photos.zip"
    if not path.exists(): raise HTTPException(404, "No ZIP file available")
    return FileResponse(path, media_type="application/zip", filename=path.name)
@router.get("/download/{filename}")
def download(filename: str, settings: Settings = Depends(get_settings)):
    path = settings.output_dir / Path(filename).name
    if not path.exists(): raise HTTPException(404, "File not found")
    return FileResponse(path, media_type="image/jpeg", filename=path.name)
@router.delete("/cleanup")
def cleanup(svc: PassportImageService = Depends(get_passport_service)): return {"removed": svc.cleanup()}
