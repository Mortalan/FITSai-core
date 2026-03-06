import os
import logging
import uuid
import subprocess
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)
CONVERSIONS_PATH = "/mnt/felicia_storage/momo_conversions"
LIBREOFFICE_PATH = "/usr/bin/libreoffice"

class DocumentConversionService:
    def __init__(self, output_dir: str = CONVERSIONS_PATH):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def _libreoffice_convert(self, input_path: str, output_format: str, output_dir: str) -> Optional[str]:
        try:
            cmd = [LIBREOFFICE_PATH, "--headless", "--convert-to", output_format, "--outdir", output_dir, input_path]
            subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            base_name = Path(input_path).stem
            output_path = os.path.join(output_dir, f"{base_name}.{output_format}")
            return output_path if os.path.exists(output_path) else None
        except Exception as e:
            logger.error(f"LibreOffice error: {e}")
            return None

    def convert_to_pdf(self, input_path: str, user_id: int) -> Optional[str]:
        user_dir = os.path.join(self.output_dir, str(user_id))
        os.makedirs(user_dir, exist_ok=True)
        return self._libreoffice_convert(input_path, "pdf", user_dir)

document_conversion = DocumentConversionService()
