import json
import zipfile
from pathlib import Path
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
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
def download_all(filenames: str | None = Query(default=None), settings: Settings = Depends(get_settings)):
    path = settings.output_dir / "passport_photos.zip"
    if filenames:
        try:
            requested_names = json.loads(filenames)
            if not isinstance(requested_names, dict): raise ValueError("filenames must be an object")
        except (json.JSONDecodeError, ValueError) as exc:
            raise HTTPException(400, "Invalid filenames mapping") from exc
        path = settings.output_dir / "passport_photos_custom.zip"
        with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as zf:
            for jpg in settings.output_dir.glob("*_passport.jpg"):
                suggested = Path(str(requested_names.get(jpg.name, jpg.name))).name
                if not suggested.lower().endswith(".jpg"): suggested = f"{Path(suggested).stem or 'passport_photo'}.jpg"
                zf.write(jpg, suggested)
    if not path.exists(): raise HTTPException(404, "No ZIP file available")
    return FileResponse(path, media_type="application/zip", filename=path.name)
@router.get("/download/{filename}")
def download(filename: str, download_filename: str | None = Query(default=None, alias="filename"), settings: Settings = Depends(get_settings)):
    path = settings.output_dir / Path(filename).name
    if not path.exists(): raise HTTPException(404, "File not found")
    suggested = Path(download_filename).name if download_filename else path.name
    if not suggested.lower().endswith(".jpg"): suggested = f"{Path(suggested).stem or 'passport_photo'}.jpg"
    return FileResponse(path, media_type="image/jpeg", filename=suggested)
@router.delete("/cleanup")
def cleanup(svc: PassportImageService = Depends(get_passport_service)): return {"removed": svc.cleanup()}
