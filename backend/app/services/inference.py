import json
import logging
import traceback
import numpy as np
import torch
import cv2
import uuid
from typing import Dict, Any

from app.core.config import settings, TEMP_DIR
from app.models.r3d_model import get_resnet3d
from app.models.lstm_model import get_lstm_model
from app.utils.video import extract_frames, preprocess_frames
from app.utils.clips import extract_clips
from app.schemas.response import InferenceResult, ImportantSegment

logger = logging.getLogger(__name__)

def run_inference(task_id: str, video_path: str, r3d_model: torch.nn.Module, lstm_model: torch.nn.Module, start_time_offset: float = 0.0):
    result_path = TEMP_DIR / f"{task_id}.json"
    
    try:
        logger.info(f"[{task_id}] Iniciando proceso de inferencia para {video_path}")
        
        # Procesamiento de video
        logger.info(f"[{task_id}] Extrayendo frames (offset start_time = {start_time_offset}s)...")
        frames = extract_frames(video_path)
        if not frames:
            raise ValueError("No se pudieron extraer frames del video.")
        
        logger.info(f"[{task_id}] Se extrajeron {len(frames)} frames. Preprocesando frames...")
        tensor_frames = preprocess_frames(frames)
        
        # Extracción de clips
        clips = extract_clips(tensor_frames)
        logger.info(f"[{task_id}] Segmentando: se generaron {len(clips)} clips listos para inferencia.")
        
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Inferencia del modelo
        features = []
        logger.info(f"[{task_id}] Extrayendo características R3D-18...")
        with torch.no_grad():
            batch_size = 16
            for i in range(0, len(clips), batch_size):
                batch_clips = clips[i:i+batch_size]
                batch_tensor = torch.stack(batch_clips).to(device) # (B, C, T, H, W)
                
                batch_features = r3d_model(batch_tensor)
                features.append(batch_features.cpu())
                
            # Limpiar caché post-R3D
            torch.cuda.empty_cache()
            
            all_features = torch.cat(features, dim=0) # (Total_Clips, 512)
            
            logger.info(f"[{task_id}] Ejecutando modelo LSTM por lotes (ventana deslizante)...")
            max_seq = settings.MAX_SEGMENTS_PER_VIDEO
            all_probs = []
            attention_curve = []
            
            for i in range(0, all_features.size(0), max_seq):
                chunk_features = all_features[i:i+max_seq]
                sequence_features = chunk_features.unsqueeze(0).to(device) # (1, chunk_len, 512)
                
                logits, attn_weights = lstm_model(sequence_features)
                all_probs.append(logits.item())
                
                attn_np = attn_weights.squeeze().cpu().numpy()
                if attn_np.ndim == 0:
                    attention_curve.append(float(attn_np))
                else:
                    attention_curve.extend(attn_np.flatten().tolist())
            
            # Limpiar caché post-LSTM
            torch.cuda.empty_cache()
        
        # Formatear la predicción y atención global
        # Aplicar Top-K Average Pooling para evitar la dilución de la anomalía sin disparar falsos positivos
        if all_probs:
            # Tomar al menos 1 lote, o el 15% de los lotes con mayor probabilidad de robo
            k = max(1, int(len(all_probs) * 0.15))
            top_k_probs = sorted(all_probs, reverse=True)[:k]
            prob_robbery = sum(top_k_probs) / len(top_k_probs)
        else:
            prob_robbery = 0.0
            
        prob_normal = 1.0 - prob_robbery
        prediction_label = "Robbery" if prob_robbery >= settings.THRESHOLD else "Normal"
        
        logger.info(f"[{task_id}] Resultados Lotes -> Predicción: {prediction_label} | Robo: {prob_robbery:.4f} | Normal: {prob_normal:.4f}")
        
        # Top-K importante clips a lo largo de todo el video
        top_k = min(5, len(attention_curve))
        attention_np = np.array(attention_curve)
        important_idx = np.argsort(attention_np)[-top_k:][::-1]
        
        important_segments = []
        for idx in important_idx:
            # Calcular timestamp
            start_frame = idx * settings.STRIDE if settings.OVERLAPPING else idx * (tensor_frames.size(1) - settings.CLIP_LEN) / max(1, len(attention_curve))
            time_sec = float(start_frame) / settings.FPS + start_time_offset
            
            important_segments.append(ImportantSegment(
                clip=int(idx),
                time=round(time_sec, 2),
                weight=round(float(attention_np[idx]), 4)
            ))
            
        final_end_time = float(tensor_frames.size(1)) / settings.FPS + start_time_offset
        logger.info(f"[{task_id}] Generados top {len(important_idx)} segmentos importantes. Video total abarcado: de {start_time_offset:.2f}s a {final_end_time:.2f}s")
            
        result = InferenceResult(
            status="Completed",
            prediction=prediction_label,
            probability_robbery=round(prob_robbery, 4),
            probability_normal=round(prob_normal, 4),
            important_segments=important_segments,
            attention_curve=[round(float(v), 4) for v in attention_curve],
            start_time=start_time_offset,
            end_time=final_end_time
        )
        
        logger.info(f"[{task_id}] Inferencia completada con éxito.")
        
    except Exception as e:
        logger.error(f"[{task_id}] Error durante la inferencia: {str(e)}")
        logger.error(traceback.format_exc())
        result = InferenceResult(
            status="Error",
            error_message=str(e)
        )
    
    # 5. Guardar JSON
    with open(result_path, "w", encoding="utf-8") as f:
        json.dump(result.model_dump(), f, ensure_ascii=False, indent=2)
