"use client";

import ReportIframe from "@/components/ui/ReportIframe";

export default function BestModelPage() {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-6">
           <h1 className="text-3xl font-extrabold mb-2 text-brand py-1 pr-2">Reporte Analítico del Mejor Modelo</h1>
           <p className="text-muted">Inspección de KPI´s definitivos, hiperparámetros logrados (Optuna) y matriz de confusión final.</p>
      </div>

      <div className="flex-1 w-full animate-fade-in">
         <ReportIframe type="best_model" />
      </div>
    </div>
  );
}