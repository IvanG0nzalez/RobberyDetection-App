import uuid
import os
import logging
from typing import Dict, Any

from fastapi import APIRouter, File, UploadFile, BackgroundTasks, Request, HTTPException, Form

from app.core.config import TEMP_DIR, settings
from app.services.inference import run_inference
from app.schemas.response import TaskResponse, InferenceResult
from app.utils.video import trim_video

log = logging.getLogger(__name__)
router = APIRouter()

@router.post("/analyze", response_model=TaskResponse)
async def analyze_video(
    request: Request, 
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...),
    start_time: float = Form(0.0),
    end_time: float = Form(0.0)
):
    task_id = str(uuid.uuid4())
    log.info(f"[{task_id}] Recibiendo solicitud de análisis: archivo={file.filename}, start_time={start_time}, end_time={end_time}")
    
    video_path = TEMP_DIR / f"{task_id}.mp4"
    result_path = TEMP_DIR / f"{task_id}.json"
    
    # Revisar y leer el tamaño del archivo
    try:
        with open(video_path, "wb") as buffer:
            # Se lee en lotes
            while True:
                chunk = await file.read(1024 * 1024 * 5) # 5MB
                if not chunk:
                    break
                buffer.write(chunk)
    except Exception as e:
        log.error(f"[{task_id}] Error guardando el video original: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error guardando el video: {str(e)}")
        
    # Recortar video original
    try:
        if end_time > start_time:
            log.info(f"[{task_id}] Recortando video desde {start_time}s hasta {end_time}s...")
            trimmed_path = TEMP_DIR / f"{task_id}_trimmed.mp4"
            trim_video(str(video_path), str(trimmed_path), float(start_time), float(end_time))
            # Reemplazar archivo original con el recortado
            if trimmed_path.exists():
                video_path.unlink(missing_ok=True)
                trimmed_path.rename(video_path)
            log.info(f"[{task_id}] Video recortado exitosamente.")
        else:
            log.info(f"[{task_id}] Procesando video completo (no se requiere recorte).")
    except Exception as e:
        log.error(f"[{task_id}] Error recortando video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error recortando el video: {str(e)}")
    
    initial_state = InferenceResult(status="processing")
    with open(result_path, "w", encoding="utf-8") as f:
        import json
        json.dump(initial_state.model_dump(), f, ensure_ascii=False, indent=2)
        
    # Obtener los modelos cargados
    r3d_model = request.app.state.models.get('r3d_18')
    lstm_model = request.app.state.models.get('lstm_classifier')
    
    # Encolar la tarea de inferencia
    background_tasks.add_task(run_inference, task_id, str(video_path), r3d_model, lstm_model, float(start_time))
    
    return TaskResponse(
        task_id=task_id, 
        status="processing", 
        message="El video está en cola para procesamiento"
    )

@router.get("/results/{task_id}", response_model=InferenceResult)
async def get_results(task_id: str, background_tasks: BackgroundTasks):
    result_path = TEMP_DIR / f"{task_id}.json"
    video_path = TEMP_DIR / f"{task_id}.mp4"
    
    if not result_path.exists():
        raise HTTPException(status_code=404, detail="Task ID no encontrado")
        
    import json
    try:
        with open(result_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        if data.get("status") in ["Completed", "Error"] and not settings.KEEP_TEMP_FILES:
            def delete_temp_files():
                try:
                    if result_path.exists():
                        result_path.unlink()
                    if video_path.exists():
                        video_path.unlink()
                    log.info(f"[{task_id}] Archivos temporales eliminados correctamente.")
                except Exception as e:
                    log.error(f"[{task_id}] Error eliminando temporales: {str(e)}")
            
            background_tasks.add_task(delete_temp_files)
            
        return InferenceResult(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error leyendo el estado: {str(e)}")
