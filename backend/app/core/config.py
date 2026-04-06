import json
from pathlib import Path
from pydantic_settings import BaseSettings

# Rutas absolutas resolviendo desde el propio backend
BASE_DIR = Path(__file__).resolve().parent.parent.parent
CONFIG_PATH = BASE_DIR / "config" / "config.json"
LSTM_WEIGHTS_PATH = BASE_DIR / "models" / "lstm_model.pth"
TEMP_DIR = BASE_DIR / "temp"

# Crear directorio temp si no existe
TEMP_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Inference API"
    FPS: int = 30
    
    # Dinámicos desde config.json
    CLIP_LEN: int = 16
    FRAME_SIZE: int = 112
    LSTM_INPUT_SIZE: int = 512
    LSTM_HIDDEN_SIZE: int = 192
    LSTM_NUM_LAYERS: int = 2
    LSTM_BIDIRECTIONAL: bool = True
    LSTM_USE_ATTENTION: bool = True
    
    OVERLAPPING: bool = True
    STRIDE: int = 8
    MAX_SEGMENTS_PER_VIDEO: int = 32
    PROCESS_FULL_VIDEO: bool = True
    THRESHOLD: float = 0.5
    KEEP_TEMP_FILES: bool = False
    
    NORM_MEAN: list = [0.43216, 0.394666, 0.37645]
    NORM_STD: list = [0.22803, 0.22145, 0.216989]

    def load_dynamic_config(self):
        if CONFIG_PATH.exists():
            with open(CONFIG_PATH, "r", encoding="utf-8-sig") as f:
                data = json.load(f)
                self.CLIP_LEN = data.get("clip_length", self.CLIP_LEN)
                self.FRAME_SIZE = data.get("frame_size", self.FRAME_SIZE)
                
                self.LSTM_INPUT_SIZE = data.get("input_size", self.LSTM_INPUT_SIZE)
                self.LSTM_HIDDEN_SIZE = data.get("hidden_size", self.LSTM_HIDDEN_SIZE)
                self.LSTM_NUM_LAYERS = data.get("num_layers", self.LSTM_NUM_LAYERS)
                self.LSTM_BIDIRECTIONAL = data.get("bidirectional", self.LSTM_BIDIRECTIONAL)
                self.LSTM_USE_ATTENTION = data.get("use_attention", self.LSTM_USE_ATTENTION)

                self.OVERLAPPING = data.get("overlapping", self.OVERLAPPING)
                self.STRIDE = data.get("stride", self.STRIDE)
                self.MAX_SEGMENTS_PER_VIDEO = data.get("max_segments_per_video", self.MAX_SEGMENTS_PER_VIDEO)
                self.PROCESS_FULL_VIDEO = data.get("process_full_video", self.PROCESS_FULL_VIDEO)
                self.THRESHOLD = data.get("classification_threshold", self.THRESHOLD)
                self.KEEP_TEMP_FILES = data.get("keep_temp_files", self.KEEP_TEMP_FILES)
                
                prep = data.get("preprocessing", {})
                self.NORM_MEAN = prep.get("mean", self.NORM_MEAN)
                self.NORM_STD = prep.get("std", self.NORM_STD)

settings = Settings()
settings.load_dynamic_config()
