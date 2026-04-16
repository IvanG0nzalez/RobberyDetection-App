"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export interface ImportantSegment {
  clip: number;
  time: number;
  weight: number;
}

export interface InferenceResponse {
  status: string;
  prediction?: string;
  probability_robbery?: number;
  probability_normal?: number;
  important_segments?: ImportantSegment[];
  attention_curve?: number[];
  error_message?: string;
  start_time?: number;
  end_time?: number;
}

export function useInference() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InferenceResponse | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Llamado al backend cada 3 segundos
  useEffect(() => {
    if (taskId) {
      timerRef.current = setInterval(async () => {
        try {
          const { data } = await axios.get<InferenceResponse>(`${API_BASE}/results/${taskId}`);
          
          if (data.status === "Completed") {
            setResult(data);
            setLoading(false);
            setTaskId(null);
            if (timerRef.current) clearInterval(timerRef.current);
            toast.success("¡Análisis de video completado!");
          } else if (data.status === "Error") {
            toast.error(`Error en análisis: ${data.error_message}`);
            setLoading(false);
            setTaskId(null);
            if (timerRef.current) clearInterval(timerRef.current);
          }
        } catch (error) {
          toast.error("Pérdida de conexión con el servidor.");
          setLoading(false);
          setTaskId(null);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 3000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [taskId]);

  const analyzeVideo = async (file: File, startTime: number, endTime: number) => {
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("start_time", startTime.toString());
    formData.append("end_time", endTime.toString());

    try {
      toast.info("Enviando video al servidor...");
      const { data } = await axios.post(`${API_BASE}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setTaskId(data.task_id);
      toast.info("Procesando análisis en el servidor...");
    } catch (error) {
      toast.error("Error subiendo archivo. Valida acceso a backend.");
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setTaskId(null);
    setLoading(false);
  };

  return { analyzeVideo, reset, loading, result };
}