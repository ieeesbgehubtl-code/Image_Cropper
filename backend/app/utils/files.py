import re, shutil, zipfile
from pathlib import Path
from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError
from pillow_heif import register_heif_opener
from app.config import Settings
register_heif_opener()
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"}
ZIP_EXTS = {".zip"}
def safe_name(name: str) -> str:
    stem = re.sub(r"[^A-Za-z0-9_.-]+", "_", Path(name).stem).strip("._") or "photo"
    return stem + Path(name).suffix.lower()
def validate_upload(file: UploadFile, settings: Settings, zip_allowed: bool = False) -> None:
    ext = Path(file.filename or "").suffix.lower()
    if ext not in IMAGE_EXTS | (ZIP_EXTS if zip_allowed else set()): raise ValueError(f"Unsupported file format: {ext}")
async def save_upload(file: UploadFile, directory: Path, settings: Settings, zip_allowed: bool = False) -> Path:
    validate_upload(file, settings, zip_allowed); target = directory / safe_name(file.filename or "upload")
    size = 0
    with target.open("wb") as fh:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk); limit = (settings.max_zip_mb if target.suffix == ".zip" else settings.max_image_mb) * 1024 * 1024
            if size > limit: raise ValueError("Uploaded file exceeds configured size limit")
            fh.write(chunk)
    if size == 0: raise ValueError("Empty uploads are not allowed")
    return target
def load_image(path: Path) -> Image.Image:
    try:
        img = Image.open(path); img.load(); return img.convert("RGB")
    except (UnidentifiedImageError, OSError) as exc: raise ValueError(f"Corrupted or unsupported image: {path.name}") from exc
def extract_zip(path: Path, temp_dir: Path, settings: Settings) -> list[Path]:
    if not zipfile.is_zipfile(path): raise ValueError("Invalid ZIP archive")
    extract_dir = temp_dir / path.stem; shutil.rmtree(extract_dir, ignore_errors=True); extract_dir.mkdir(parents=True)
    files: list[Path] = []
    with zipfile.ZipFile(path) as zf:
        for info in zf.infolist():
            name = Path(info.filename).name
            if info.is_dir() or name.startswith(".") or Path(name).suffix.lower() not in IMAGE_EXTS: continue
            if len(files) >= settings.max_zip_images: break
            dest = extract_dir / safe_name(name)
            with zf.open(info) as src, dest.open("wb") as out: shutil.copyfileobj(src, out)
            files.append(dest)
    if not files: raise ValueError("ZIP archive contains no supported images")
    return files
