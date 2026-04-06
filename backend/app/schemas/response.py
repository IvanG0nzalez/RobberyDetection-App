from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class TaskResponse(BaseModel):
    task_id: str
    status: str
    message: str

class ImportantSegment(BaseModel):
    clip: int
    time: float
    weight: float

class InferenceResult(BaseModel):
    status: str
    prediction: Optional[str] = None
    probability_robbery: Optional[float] = None
    probability_normal: Optional[float] = None
    important_segments: Optional[List[ImportantSegment]] = None
    attention_curve: Optional[List[float]] = None
    error_message: Optional[str] = None
