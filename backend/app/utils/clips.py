import torch
from app.core.config import settings

def extract_clips(tensor_frames: torch.Tensor) -> list:
    """Extrae clips overlapping o uniformes desde un tensor (C, T, H, W)"""
    total_frames = tensor_frames.size(1)
    clip_len = settings.CLIP_LEN
    stride = settings.STRIDE
    max_segments = settings.MAX_SEGMENTS_PER_VIDEO
    
    clips = []
    
    if settings.OVERLAPPING:
        start = 0
        while (start + clip_len) <= total_frames:
            clip = tensor_frames[:, start:start+clip_len, :, :]
            clips.append(clip)
            start += stride
            
            if not settings.PROCESS_FULL_VIDEO and len(clips) >= max_segments:
                break
    else:
        # Muestreo uniforme
        for i in range(max_segments):
            start_idx = int(i * (total_frames - clip_len) / max_segments)
            if start_idx < 0:
                start_idx = 0
            
            end_idx = min(start_idx + clip_len, total_frames)
            
            # Agregar padding si el clip es muy corto
            clip = tensor_frames[:, start_idx:end_idx, :, :]
            if clip.size(1) < clip_len:
                pad_size = clip_len - clip.size(1)
                padding = clip[:, -1:, :, :].repeat(1, pad_size, 1, 1)
                clip = torch.cat([clip, padding], dim=1)
                
            clips.append(clip)
            
    # Manejar caso en videos muy cortos
    if len(clips) == 0:
        if total_frames > 0:
            clip = tensor_frames
            if total_frames < clip_len:
                pad_size = clip_len - total_frames
                padding = clip[:, -1:, :, :].repeat(1, pad_size, 1, 1)
                clip = torch.cat([clip, padding], dim=1)
            clips.append(clip)
            
    return clips
