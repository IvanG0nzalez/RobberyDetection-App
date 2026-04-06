import logging
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.models.r3d_model import get_resnet3d
from app.models.lstm_model import get_lstm_model
from app.api.routes import router

# Configuración de Logging
logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicialización de modelos en memoria GPU/CPU
    logger.info("Cargando modelo R3D-18 en memoria...")
    r3d_model = get_resnet3d()
    
    logger.info("Cargando modelo LSTMClassifier en memoria...")
    lstm_model = get_lstm_model()
    
    app.state.models = {
        'r3d_18': r3d_model,
        'lstm_classifier': lstm_model
    }
    
    logger.info("Modelos cargados exitosamente.")
    yield
    
    # Limpieza
    logger.info("Descargando modelos y liberando recursos...")
    app.state.models.clear()
    import torch
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api", tags=["Inference"])

@app.get("/")
def health_check():
    return {"status": "ok", "project": settings.PROJECT_NAME}
