"use client";

import ReportIframe from "@/components/ui/ReportIframe";

export default function CompareExperimentsPage() {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-6">
           <h1 className="text-3xl font-extrabold mb-2 text-brand py-1 pr-2">Comparación de Experimentos</h1>
           <p className="text-muted">Vista comparativa con matrices y métricas de desempeño sobre los experimentos realizados con distintas configuraciones.</p>
      </div>

      <div className="flex-1 w-full animate-fade-in">
         <ReportIframe type="compare" />
      </div>
    </div>
  );
}