"use client";

import { useRef, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { PlayCircle, ShieldCheck, AlertTriangle } from "lucide-react";
import { InferenceResponse, ImportantSegment } from "@/hooks/useInference";

export default function AnalysisDashboard({
  result,
  videoBlobUrl,
}: {
  result: InferenceResponse;
  videoBlobUrl: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeClipIndex, setActiveClipIndex] = useState<number | null>(null);

  const isRobbery = result.prediction === "Robbery";
  const prob_robb = (result.probability_robbery ?? 0) * 100;
  const prob_norm = (result.probability_normal ?? 0) * 100;
  const numClips = result.attention_curve?.length || 1;

  // Formato para recharts
  const chartData = result.attention_curve?.map((val, idx) => ({
    time: `Clip ${idx}`,
    vol: val,
  })) || [];

  const jumpToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const vid = e.currentTarget;
    if (vid.duration && vid.duration > 0 && numClips > 0) {
      const ratio = Math.max(0, Math.min(1, vid.currentTime / vid.duration));
      const idx = Math.floor(ratio * numClips);
      setActiveClipIndex(idx >= numClips ? numClips - 1 : idx);
    } else {
      setActiveClipIndex(null);
    }
  };

  const handleChartClick = (e: any) => {
    if (e && e.activeTooltipIndex !== undefined && videoRef.current && videoRef.current.duration) {
      const idx = e.activeTooltipIndex;
      const jumpTime = (idx / numClips) * videoRef.current.duration;
      videoRef.current.currentTime = jumpTime;
      videoRef.current.play();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {/* Columna Izquierda: Predicción y Probabilidad */}
      <div className="col-span-1 flex flex-col gap-6">
        {/* Resultado Masivo */}
        <div className={`p-8 rounded-xl border flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden h-48 border-line bg-card`}>
          <div className="z-10 flex flex-col items-center">
            {isRobbery ? (
              <AlertTriangle className="text-danger mb-4" size={48} />
            ) : (
              <ShieldCheck className="text-success mb-4" size={48} />
            )}
            <h2 className="text-4xl font-extrabold mb-1" style={{ color: isRobbery ? "var(--danger)" : "var(--success)" }}>
              {isRobbery ? "R O B O" : "N O R M A L"}
            </h2>
            <p className="text-sm opacity-80 mt-2 font-medium">PREDICCIÓN</p>
          </div>
        </div>

        {/* Probabilidades */}
        <div className="p-6 rounded-xl border border-line bg-card shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-brand">Probabilidades</h3>

          <div className="mb-5">
            <div className="flex justify-between text-sm mb-2 font-medium">
               <span className="text-danger flex items-center gap-2"><AlertTriangle size={16}/>Prob. de Robo</span>
               <span>{prob_robb.toFixed(2)}%</span>
            </div>
            <div className="w-full bg-line rounded-full h-3">
              <div className="bg-danger rounded-full h-3" style={{ width: `${prob_robb}%` }}></div>
            </div>
          </div>

          <div>
             <div className="flex justify-between text-sm mb-2 font-medium">
               <span className="text-success flex items-center gap-2"><ShieldCheck size={16}/>Prob. Normal</span>
               <span>{prob_norm.toFixed(2)}%</span>
            </div>
            <div className="w-full bg-line rounded-full h-3">
              <div className="bg-success rounded-full h-3" style={{ width: `${prob_norm}%` }}></div>
            </div>
          </div>
        </div>
        
        {/* Segmentos Clave */}
        <div className="p-6 rounded-xl border border-line bg-card shadow-sm">
          <h3 className="text-xl font-bold mb-4 text-brand">Top Segmentos</h3>
          <p className="text-sm text-muted mb-4">Click para reproducir en el tiempo exacto.</p>
          <ul className="flex flex-col gap-3">
            {result.important_segments?.map((seg: ImportantSegment, idx: number) => (
              <li 
                key={idx} 
                onClick={() => jumpToTime(seg.time)}
                className="p-3 border border-line rounded-lg flex items-center justify-between cursor-pointer hover:bg-brand/10 transition-colors"
                title={`Clip peso atencional: ${seg.weight.toFixed(4)}`}
              >
                  <div className="flex items-center gap-3">
                    <button className="text-brand hover:opacity-75 transition-opacity cursor-pointer"> <PlayCircle size={20} /> </button>
                    <span className="font-semibold text-sm">Clip {seg.clip}</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="text-xs px-2 py-1 bg-ink text-bg rounded-md font-mono">{seg.time.toFixed(2)}s</span>
                    <span className="text-xs text-muted w-12 text-right">★ {seg.weight.toFixed(3)}</span>
                  </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Columna Derecha: Video Y Gráfica */}
      <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
        
        {/* Reproductor Destacado */}
        <div className="p-1 rounded-xl border border-line bg-card shadow-sm overflow-hidden flex flex-col items-center">
             <video 
              ref={videoRef}
              src={videoBlobUrl}
              controls 
              onTimeUpdate={handleTimeUpdate}
              className="w-full rounded-lg bg-black object-contain max-h-[450px]"
            />
        </div>

        {/* Gráfico de Atención Lineal */}
        <div className="p-6 rounded-xl border border-line bg-card shadow-sm flex-1 min-h-[250px] flex flex-col">
           <h3 className="text-xl font-bold mb-4 text-brand">Curva de Atención Temporal</h3>
           <p className="text-sm text-muted mb-4">Click sobre puntos en la gráfica para saltar al fragmento en el video.</p>
           <div className="flex-1 w-full" style={{ minHeight: "220px" }}>
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} onClick={handleChartClick} style={{ cursor: "pointer" }}>
                  {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                  <defs>
                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isRobbery ? "var(--danger)" : "var(--brand)"} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={isRobbery ? "var(--danger)" : "var(--brand)"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis hide width={40} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--line)", color: "var(--ink)", borderRadius: "8px" }} 
                    itemStyle={{ color: "var(--ink)", fontWeight: "bold" }}
                  />
                  {activeClipIndex !== null && chartData[activeClipIndex] && (
                    <ReferenceLine 
                      x={chartData[activeClipIndex].time} 
                      stroke={isRobbery ? "var(--danger)" : "var(--brand)"} 
                      strokeWidth={2}
                      strokeOpacity={0.6}
                      strokeDasharray="4 4"
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="vol"
                    stroke={isRobbery ? "var(--danger)" : "var(--brand)"}
                    fillOpacity={1}
                    fill="url(#colorVol)"
                    strokeWidth={2}
                    animationDuration={1500}
                  />
                </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
}