"use client";

import { useState } from "react";
import ReportIframe from "@/components/ui/ReportIframe";

export default function EDAReportPage() {
  const [activeDataset, setActiveDataset] = useState<"original" | "recortados">("original");

  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h1 className="text-3xl font-extrabold mb-2 text-brand py-1 pr-2">Análisis Exploratorio de Datos (EDA)</h1>
           <p className="text-muted">Estudio descriptivo del comportamiento y composición de los datasets empleados.</p>
        </div>

        {/* Custom Tabs */}
        <div className="flex p-1 bg-line/20 rounded-lg shrink-0 w-fit">
           <button 
             onClick={() => setActiveDataset("original")}
             className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeDataset === "original" ? "bg-card text-brand border border-line shadow-sm" : "text-muted hover:text-ink"}`}
           >
             Videos Originales
           </button>
           <button 
             onClick={() => setActiveDataset("recortados")}
             className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeDataset === "recortados" ? "bg-card text-brand border border-line shadow-sm" : "text-muted hover:text-ink"}`}
           >
             Videos Recortados
           </button>
        </div>
      </div>

      <div className="flex-1 w-full animate-fade-in relative flex auto">
        {activeDataset === "original" ? (
           <ReportIframe type="eda_original" key="original" />
        ) : (
           <ReportIframe type="eda_recortados" key="recortados" />
        )}
      </div>
    </div>
  );
}