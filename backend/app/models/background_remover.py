import threading
import numpy as np
import torch
from PIL import Image
from loguru import logger
from transformers import AutoModelForImageSegmentation, AutoProcessor
from app.config import Settings

class BackgroundRemover:
    """Thread-safe RMBG-2.0/BiRefNet alpha matting service returning transparent RGBA images."""
    def __init__(self, settings: Settings) -> None:
        self.settings = settings; self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None; self.processor = None; self.model_name = settings.background_model; self._lock = threading.Lock()
    def load(self) -> None:
        with self._lock:
            if self.model is not None: return
            for model_name in (self.settings.background_model, self.settings.fallback_background_model):
                try:
                    self.processor = AutoProcessor.from_pretrained(model_name, trust_remote_code=True, local_files_only=self.settings.hf_local_files_only)
                    self.model = AutoModelForImageSegmentation.from_pretrained(model_name, trust_remote_code=True, local_files_only=self.settings.hf_local_files_only).to(self.device).eval()
                    self.model_name = model_name; logger.info("Loaded background model {} on {}", model_name, self.device); return
                except Exception as exc:
                    logger.warning("Failed to load background model {}: {}", model_name, exc)
            raise RuntimeError("Unable to load RMBG-2.0 or BiRefNet background model")
    def remove(self, image: Image.Image) -> Image.Image:
        if self.model is None or self.processor is None: self.load()
        rgb = image.convert("RGB")
        with self._lock, torch.no_grad():
            inputs = self.processor(images=rgb, return_tensors="pt").to(self.device)  # type: ignore[union-attr]
            with torch.autocast(device_type="cuda", enabled=self.device == "cuda"):
                outputs = self.model(**inputs)  # type: ignore[misc]
            mask = outputs.logits if hasattr(outputs, "logits") else outputs[0]
            mask = torch.nn.functional.interpolate(mask, size=rgb.size[::-1], mode="bilinear", align_corners=False)
            alpha = mask.sigmoid().squeeze().detach().float().cpu().numpy()
        alpha_img = Image.fromarray((np.clip(alpha, 0, 1) * 255).astype("uint8"), mode="L")
        rgba = rgb.convert("RGBA"); rgba.putalpha(alpha_img)
        logger.info("Background removed with {}", self.model_name)
        return rgba
