"use client";

import { Activity } from "lucide-react";

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full animate-pulse">
      {/* Columna Izquierda Skeletons */}
      <div className="col-span-1 flex flex-col gap-6">
        
        {/* Resultado Hero */}
        <div className="h-48 rounded-xl bg-line/20 border border-line flex items-center justify-center relative">
             <Activity className="absolute text-brand/30 animate-spin" size={64}/>
             <div className="h-8 w-24 bg-line/30 rounded-full mt-4"></div>
        </div>

        {/* Probabilidades */}
        <div className="p-6 rounded-xl bg-line/10 border border-line h-48 flex flex-col justify-center gap-4">
           <div className="h-4 bg-line/20 rounded w-1/2 mb-4"></div>
           <div className="h-3 bg-line/30 rounded-full w-full"></div>
           <div className="h-3 bg-line/30 rounded-full w-full"></div>
           <div className="h-4 bg-line/20 rounded w-1/3 mt-2"></div>
        </div>

        {/* Segmentos Clave */}
        <div className="p-6 rounded-xl bg-line/10 border border-line h-64 flex flex-col gap-3">
            <div className="h-5 bg-line/20 rounded w-1/2 mb-2"></div>
            <div className="h-12 bg-line/30 rounded-lg w-full"></div>
            <div className="h-12 bg-line/30 rounded-lg w-full"></div>
            <div className="h-12 bg-line/30 rounded-lg w-full"></div>
        </div>
      </div>

      {/* Columna Derecha Skeletons */}
      <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
        
        {/* Video Player */}
        <div className="h-[450px] rounded-xl bg-line/20 border border-line flex flex-col justify-center items-center font-mono text-sm text-muted relative overflow-hidden">
             <div className="absolute inset-0 transition-opacity bg-gradient-to-tr from-brand/5 to-danger/5"></div>
             <p className="z-10 flex gap-2 items-center"><Activity size={18} className="animate-spin"/> PROCESANDO...</p>
        </div>

        {/* Chart */}
        <div className="flex-1 min-h-[250px] p-6 rounded-xl bg-line/10 border border-line flex flex-col">
             <div className="h-6 bg-line/30 rounded w-1/3 mb-auto"></div>
             
             {/* Fake Bars */}
             <div className="mt-8 flex items-end gap-2 h-40 opacity-40">
                {[1, 2, 3, 5, 2, 7, 3, 8, 4, 3, 1, 9, 3, 5].map((_, i) => (
                    <div key={i} className="flex-1 bg-line/50 rounded-t-md" style={{ height: `${Math.random() * 80 + 10}%` }}></div>
                ))}
             </div>
        </div>

      </div>
    </div>
  );
}