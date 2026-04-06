import cv2
import torch
import numpy as np
from torchvision import transforms
from app.core.config import settings

def extract_frames(video_path: str) -> list:
    """Extract frames from a video path, resampling them to the configured FPS.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"No se pudo abrir el video {video_path}")

    original_fps = cap.get(cv2.CAP_PROP_FPS)
    target_fps = settings.FPS
    
    # Calcular el factor de salto o lógica de intervalo de frames basado en el FPS objetivo
    original_interval = 1.0 / original_fps if original_fps > 0 else 1.0/target_fps
    target_interval = 1.0 / target_fps
    
    frames = []
    current_time = 0.0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_time = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000.0
        
        if frame_time >= current_time:
            # OpenCV usa BGR, lo pasamos a RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(frame_rgb)
            current_time += target_interval
    
    cap.release()
    return frames

def preprocess_frames(frames: list) -> torch.Tensor:
    """
    Aplicar transformaciones de PyTorch torchvision a una lista de frames.
    Salida un tensor de forma (C, T, H, W) para ser compatible con R3D_18.
    """
    transform = transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize((settings.FRAME_SIZE, settings.FRAME_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=settings.NORM_MEAN, std=settings.NORM_STD)
    ])
    
    processed = []
    for frame in frames:
        processed.append(transform(frame))
    
    tensor_frames = torch.stack(processed)
    
    # Permutar de (T, C, H, W) a (C, T, H, W)
    # R3D espera entrada en formato (C, T, H, W)
    tensor_frames = tensor_frames.permute(1, 0, 2, 3) 
    
    return tensor_frames
