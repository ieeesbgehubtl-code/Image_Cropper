from app.config import get_settings
from app.models.background_remover import BackgroundRemover
from app.models.face_detector import FaceDetector
from app.services.passport import PassportImageService
settings = get_settings(); face_detector = FaceDetector(settings); background_remover = BackgroundRemover(settings)
def get_passport_service() -> PassportImageService: return PassportImageService(settings, face_detector, background_remover)
