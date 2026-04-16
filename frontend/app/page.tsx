"use client";

import { useEffect, useState } from "react";
import Uploader from "@/components/ui/Uploader";
import { DashboardSkeleton } from "@/components/ui/Skeletons";
import PredictionCards from "@/components/results/PredictionCards";
import { useInference } from "@/hooks/useInference";
import { ArrowLeft } from "lucide-react";

export default function Home() {
  const { analyzeVideo, reset, loading, result } = useInference();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Mantener una url de blob del video cargado en memoria RAM
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoFile]);

  const handleVideoSelect = (file: File, startTime: number, endTime: number) => {
    setVideoFile(file);
    analyzeVideo(file, startTime, endTime);
  };

  const handleRestart = () => {
    setVideoFile(null);
    setVideoUrl(null);
    reset();
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-extrabold mb-2 text-brand py-1 pr-2">Analizar Video</h1>
           <p className="text-muted">Detección de robos con R3D-18 y LSTM</p>
        </div>
        
        {(loading || result) && (
           <button 
             onClick={handleRestart}
             className="px-4 py-2 border border-line rounded-lg flex items-center gap-2 hover:bg-line/20 font-medium transition-colors cursor-pointer"
           >
             <ArrowLeft size={16} /> Subir otro video
           </button>
        )}
      </div>

      {/* Flujo Vista 1: Subida de archivo (Estado Cero) */}
      {!loading && !result && (
        <Uploader onFileSelected={handleVideoSelect} />
      )}

      {/* Flujo Vista 2: Esqueletos Polling (Transcurriendo Asíncronamente) */}
      {loading && (
         <div className="animate-fade-in w-full">
             <div className="pb-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand/10 text-brand font-bold rounded-full text-sm">
                  <div className="w-2 h-2 rounded-full bg-brand animate-ping" />
                  ANÁLISIS EN CURSO ...
                </div>
             </div>
             <DashboardSkeleton />
         </div>
      )}

      {/* Flujo Vista 3: Resultados Satisfactorios Completados */}
      {!loading && result && result.status === "Completed" && (
         <div className="animate-fade-in-up">
             <PredictionCards result={result} videoBlobUrl={videoUrl!} />
         </div>
      )}
    </div>
  );
}