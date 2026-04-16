import cv2
import torch
import numpy as np
from torchvision import transforms
from app.core.config import settings
import os

def trim_video(input_path: str, output_path: str, start_time: float, end_time: float):
    """
    Recorta el video desde start_time hasta end_time y lo guarda en output_path.
    """
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        raise ValueError(f"No se pudo abrir el video {input_path}")
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = settings.FPS

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    # Calcular los frames de inicio y fin
    start_frame = int(start_time * fps)
    if end_time > start_time:
        end_frame = int(end_time * fps)
    else:
        # Si no hay end_time especificado, grabar hasta el final
        end_frame = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
    cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
    current_frame = start_frame
    
    while cap.isOpened() and current_frame <= end_frame:
        ret, frame = cap.read()
        if not ret:
            break
        out.write(frame)
        current_frame += 1
        
    cap.release()
    out.release()

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
