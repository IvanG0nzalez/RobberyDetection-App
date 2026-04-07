"use client";

import { UploadCloud, CheckCircle, Video, Play, Pause, Loader2 } from "lucide-react";
import { ChangeEvent, DragEvent, useState, useRef, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export default function Uploader({ onFileSelected }: { onFileSelected: (f: File) => void }) {
  const [isDrag, setIsDrag] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [, setCurrentTime] = useState(0);
  const [isTrimming, setIsTrimming] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  useEffect(() => {
    // Carga de FFmpeg en el montaje
    const loadFFmpeg = async () => {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg.loaded) {
        await ffmpeg.load();
      }
    };
    loadFFmpeg();
  }, []);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDrag(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type === "video/mp4") {
      setSelectedFile(file);
    } else {
      alert("Por favor, sube un archivo .mp4 válido.");
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const d = videoRef.current.duration;
      setDuration(d);
      setStartTime(0);
      setEndTime(d);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      if (current >= endTime && isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        if (videoRef.current.currentTime >= endTime) {
          videoRef.current.currentTime = startTime;
        }
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const trimVideo = async () => {
    if (!selectedFile) return;
    
    // Si no recortó nada realmente, pasar el archivo intacto
    if (startTime === 0 && endTime === duration) {
       onFileSelected(selectedFile);
       return;
    }

    setIsTrimming(true);
    try {
      const ffmpeg = ffmpegRef.current;
      
      // Escribir archivo al FS virtual de ffmpeg
      const inputName = 'input.mp4';
      const outputName = 'output.mp4';
      await ffmpeg.writeFile(inputName, await fetchFile(selectedFile));

      // Ejecutar ffmpeg para recortar (-ss: inicio, -t: duración, -c:v copy: copiar codec sin recodificar)
      const trimDuration = endTime - startTime;
      await ffmpeg.exec([
        '-i', inputName,
        '-ss', startTime.toString(),
        '-t', trimDuration.toString(),
        '-c', 'copy',
        outputName
      ]);

      // Leer resultado
      const data = await ffmpeg.readFile(outputName);
      
      // Crear un blob y nuevo obj 'File' recortado
      const trimmedBlob = new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' });
      const trimmedFile = new File([trimmedBlob], `recortado_${selectedFile.name}`, { type: 'video/mp4' });
      
      onFileSelected(trimmedFile);
    } catch (error) {
      console.error(error);
      alert("Hubo un error recortando el video.");
    } finally {
      setIsTrimming(false);
    }
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    setVideoUrl(null);
    setDuration(0);
    setStartTime(0);
    setEndTime(0);
  };

  if (selectedFile && videoUrl) {
    return (
      <div className="bg-card w-full rounded-xl border border-line shadow-sm overflow-hidden p-6 max-w-4xl mx-auto mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Video className="text-brand" /> Recortar Video
          </h2>
          <button 
            onClick={cancelSelection}
            disabled={isTrimming}
            className="text-sm text-bg bg-muted hover:bg-muted/80 disabled:bg-line px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>

        <div className="relative w-full bg-black rounded-lg overflow-hidden flex items-center justify-center min-h-[300px] mb-6">
          <video 
            ref={videoRef}
            src={videoUrl}
            className="max-h-[50vh] max-w-full"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onClick={handlePlayPause}
            onEnded={() => setIsPlaying(false)}
          />
          <button 
            onClick={handlePlayPause}
            className={`absolute inset-0 m-auto w-16 h-16 bg-black/50 hover:bg-black/70 flex items-center justify-center rounded-full text-white transition-opacity cursor-pointer ${isPlaying ? 'opacity-0' : 'opacity-100 hover:opacity-100'}`}
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>
        </div>

        {duration > 0 && (
          <div className="space-y-6">
            <div className="relative w-full h-8 pt-2">
              <style jsx>{`
                .range-slider { pointer-events: none; }
                .range-slider::-webkit-slider-thumb { pointer-events: auto; width: 16px; height: 24px; cursor: pointer; }
                .range-slider::-moz-range-thumb { pointer-events: auto; width: 16px; height: 24px; cursor: pointer; }
              `}</style>
              <div className="absolute w-full h-2 bg-line rounded-full top-3" />
              
              <div 
                className="absolute h-2 bg-brand rounded-full top-3 z-10"
                style={{ 
                  left: `${(startTime / duration) * 100}%`,
                  width: `${((endTime - startTime) / duration) * 100}%`
                }}
              />

              <input 
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={startTime}
                onChange={(e) => {
                  const minDuration = Math.min(3.0, duration);
                  const val = Math.min(Number(e.target.value), endTime - minDuration);
                  setStartTime(val);
                  if (videoRef.current) videoRef.current.currentTime = val;
                }}
                className="absolute w-full top-2 h-4 opacity-0 z-20 range-slider"
              />
              
              <input 
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={endTime}
                onChange={(e) => {
                  const minDuration = Math.min(3.0, duration);
                  const val = Math.max(Number(e.target.value), startTime + minDuration);
                  setEndTime(val);
                  if (videoRef.current) videoRef.current.currentTime = val;
                }}
                className="absolute w-full top-2 h-4 opacity-0 z-30 range-slider"
              />

              <div 
                className="absolute top-1 w-4 h-6 bg-white border-2 border-brand rounded shadow cursor-pointer z-10 pointer-events-none transform -translate-x-1/2"
                style={{ left: `${(startTime / duration) * 100}%` }}
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {formatTime(startTime)}
                </div>
              </div>
              <div 
                className="absolute top-1 w-4 h-6 bg-white border-2 border-brand rounded shadow cursor-pointer z-10 pointer-events-none transform -translate-x-1/2"
                style={{ left: `${(endTime / duration) * 100}%` }}
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {formatTime(endTime)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted">
              <div>Duración a enviar: <span className="font-semibold text-foreground">{formatTime(endTime - startTime)}</span> / {formatTime(duration)}</div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-line">
              <button 
                onClick={trimVideo}
                disabled={isTrimming}
                className="bg-brand hover:opacity-90 disabled:opacity-50 text-bg font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-opacity shadow-md cursor-pointer disabled:cursor-not-allowed"
              >
                {isTrimming ? (
                  <><Loader2 size={18} className="animate-spin" /> Recortando video...</>
                ) : (
                  <><CheckCircle size={18} /> Confirmar y Procesar</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
      onDragLeave={() => setIsDrag(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer bg-card min-h-[400px] text-center max-w-2xl mx-auto w-full mt-10
        ${isDrag ? "border-brand bg-brand/5" : "border-line hover:bg-brand/5"}`}
    >
      <UploadCloud size={64} className="text-brand mb-4 opacity-80" />
      <h2 className="text-2xl font-bold mb-2">Arrastra un video aquí</h2>
      <p className="text-muted mb-8">Formato soportado: .mp4</p>
      
      <label className="bg-brand text-bg px-6 py-3 rounded-lg font-medium shadow-md hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-2">
        Seleccionar Archivo
        <input 
          type="file" 
          accept="video/mp4" 
          onChange={handleChange}
          className="hidden" 
        />
      </label>
    </div>
  );
}