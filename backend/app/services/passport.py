import shutil, time, zipfile
from pathlib import Path
import cv2, numpy as np
from PIL import Image
from loguru import logger
from app.config import Settings
from app.models.background_remover import BackgroundRemover
from app.models.face_detector import FaceDetector
from app.schemas.passport import BatchResponse, PassportResult
from app.utils.files import extract_zip, load_image, safe_name

class PassportImageService:
    """Orchestrates validation, face detection, AI background removal, crop, compositing, and export."""
    def __init__(self, settings: Settings, face_detector: FaceDetector, background_remover: BackgroundRemover) -> None:
        self.settings = settings; self.face_detector = face_detector; self.background_remover = background_remover
    def process_image(self, path: Path, background: str) -> PassportResult:
        start = time.perf_counter(); name = safe_name(path.name)
        try:
            image = load_image(path)
            bgr = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            face, face_count = self.face_detector.largest(bgr)
            cropped = self._crop_for_passport(image, face)
            rgba = self.background_remover.remove(cropped)
            composed = self._compose(rgba, background).resize((self.settings.output_width, self.settings.output_height), Image.Resampling.LANCZOS)
            output = self.settings.output_dir / f"{Path(name).stem}.jpg"
            composed.save(output, "JPEG", quality=self.settings.jpeg_quality, optimize=True)
            logger.info("Processed {} in {:.2f}s", name, time.perf_counter() - start)
            return PassportResult(original_filename=name, output_filename=output.name, download_url=f"/api/download/{output.name}", success=True, message="Processed successfully", face_count=face_count)
        except Exception as exc:
            logger.exception("Failed processing {}", name)
            return PassportResult(original_filename=name, success=False, message=str(exc))
    def process_many(self, paths: list[Path], background: str) -> BatchResponse:
        results = [self.process_image(p, background) for p in paths]
        ok = sum(r.success for r in results); zip_url = self.create_zip() if ok else None
        return BatchResponse(total=len(results), succeeded=ok, failed=len(results)-ok, results=results, zip_download_url=zip_url)
    def process_zip(self, zip_path: Path, background: str) -> BatchResponse:
        files = extract_zip(zip_path, self.settings.temp_dir, self.settings)
        try: return self.process_many(files, background)
        finally: shutil.rmtree(files[0].parent, ignore_errors=True) if files else None
    def create_zip(self) -> str:
        zip_path = self.settings.output_dir / "passport_photos.zip"
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for jpg in self.settings.output_dir.glob("*.jpg"): zf.write(jpg, jpg.name)
        return "/api/download/all"
    def cleanup(self) -> int:
        count = 0
        for folder in (self.settings.upload_dir, self.settings.output_dir, self.settings.temp_dir):
            for item in folder.glob("*"):
                count += 1
                shutil.rmtree(item, ignore_errors=True) if item.is_dir() else item.unlink(missing_ok=True)
        logger.info("Cleanup removed {} item(s)", count); return count
    def _crop_for_passport(self, image: Image.Image, face) -> Image.Image:
        w, h = image.size; fw, fh = face.x2-face.x1, face.y2-face.y1; cx, cy = face.center
        crop_h = int(fh * 3.45); crop_w = int(crop_h * self.settings.output_width / self.settings.output_height)
        top = int(cy - fh * 1.15); left = int(cx - crop_w / 2)
        left = max(0, min(left, w - crop_w)); top = max(0, min(top, h - crop_h))
        right, bottom = min(w, left + crop_w), min(h, top + crop_h)
        crop = image.crop((left, top, right, bottom))
        if crop.size[0] / crop.size[1] > self.settings.output_width / self.settings.output_height:
            new_w = int(crop.size[1] * self.settings.output_width / self.settings.output_height); dx = (crop.size[0]-new_w)//2; crop = crop.crop((dx,0,dx+new_w,crop.size[1]))
        return crop
    def _compose(self, rgba: Image.Image, hex_color: str) -> Image.Image:
        color = hex_color.strip() or "#FFFFFF"
        if not color.startswith("#") or len(color) != 7: raise ValueError("Background color must be a HEX value like #FFFFFF")
        bg = Image.new("RGBA", rgba.size, color + "FF")
        return Image.alpha_composite(bg, rgba.convert("RGBA")).convert("RGB")
