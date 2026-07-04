from dataclasses import dataclass
import threading
import cv2
import numpy as np
from insightface.app import FaceAnalysis
from loguru import logger
from app.config import Settings

@dataclass(frozen=True)
class FaceBox:
    x1: int; y1: int; x2: int; y2: int; score: float
    @property
    def area(self) -> int: return max(0, self.x2-self.x1)*max(0, self.y2-self.y1)
    @property
    def center(self) -> tuple[float, float]: return ((self.x1+self.x2)/2, (self.y1+self.y2)/2)

class FaceDetector:
    """InsightFace detector wrapper. Detection only; embeddings/recognition are never exposed."""
    def __init__(self, settings: Settings) -> None:
        self.settings = settings; self._lock = threading.Lock(); self.app: FaceAnalysis | None = None
    def load(self) -> None:
        with self._lock:
            if self.app is not None: return
            providers = ["CPUExecutionProvider"]
            self.app = FaceAnalysis(name=self.settings.insightface_model, providers=providers, allowed_modules=["detection"])
            self.app.prepare(ctx_id=0, det_size=self.settings.insightface_det_size)
            logger.info("InsightFace detection model loaded using CPUExecutionProvider")
    def detect(self, image: np.ndarray) -> list[FaceBox]:
        if self.app is None: self.load()
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        faces = self.app.get(rgb)  # type: ignore[union-attr]
        boxes: list[FaceBox] = []
        h, w = image.shape[:2]
        for face in faces:
            x1, y1, x2, y2 = [int(round(v)) for v in face.bbox]
            boxes.append(FaceBox(max(0,x1), max(0,y1), min(w,x2), min(h,y2), float(getattr(face, "det_score", 0.0))))
        logger.info("Detected {} face(s)", len(boxes))
        return boxes
    def largest(self, image: np.ndarray) -> tuple[FaceBox, int]:
        boxes = self.detect(image)
        if not boxes: raise ValueError("No face detected in image")
        return max(boxes, key=lambda b: b.area), len(boxes)
