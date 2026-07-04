import io
import threading
from PIL import Image
from loguru import logger
from rembg import new_session, remove
from app.config import Settings

class BackgroundRemover:
    """Thread-safe background removal service using rembg."""
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.session = None
        self._lock = threading.Lock()

    def load(self) -> None:
        with self._lock:
            if self.session is not None:
                return
            self.session = new_session()
            logger.info("Loaded rembg background remover")

    def remove(self, image: Image.Image) -> Image.Image:
        if self.session is None:
            self.load()

        input_image = image.convert("RGBA")
        with io.BytesIO() as buffer:
            input_image.save(buffer, format="PNG")
            input_bytes = buffer.getvalue()

        result = remove(input_bytes, session=self.session)
        if isinstance(result, bytes):
            result_image = Image.open(io.BytesIO(result))
        elif isinstance(result, Image.Image):
            result_image = result
        else:
            raise TypeError(f"Unexpected rembg.remove return type: {type(result)}")

        return result_image.convert("RGBA")
