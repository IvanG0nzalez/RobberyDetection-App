"use client";

import { UploadCloud } from "lucide-react";
import { ChangeEvent, DragEvent, useState } from "react";

export default function Uploader({ onFileSelected }: { onFileSelected: (f: File) => void }) {
  const [isDrag, setIsDrag] = useState(false);

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
      onFileSelected(file);
    } else {
      alert("Por favor, sube un archivo .mp4 válido.");
    }
  };

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
      
      <label className="bg-brand text-bg px-6 py-3 rounded-lg font-medium shadow-md hover:bg-brand-hover transition-colors cursor-pointer inline-flex items-center gap-2">
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