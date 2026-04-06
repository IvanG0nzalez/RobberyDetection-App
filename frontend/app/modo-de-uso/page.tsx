import React from "react";
import { 
  FileVideo, 
  ServerCog, 
  BrainCircuit, 
  TrendingUp, 
  MousePointerClick 
} from "lucide-react";

export const metadata = {
  title: "Modo de uso | Securify",
  description: "Explicación del flujo de funcionamiento del análisis de video.",
};

export default function ModoDeUsoPage() {
  return (
    <div className="max-w-4xl mx-auto pb-12 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink mb-2">Modo de uso del Sistema</h1>
        <p className="text-muted text-lg">
          Conoce cómo funciona Securify: desde que se carga un video hasta que se obtiene la predicción y se analiza la curva de atención.
        </p>
      </div>

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-line before:to-transparent">
        
        {/* Paso 1 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-brand bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 bg-brand/10 text-brand z-10 transition-colors">
            <FileVideo size={20} />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-line bg-card shadow-sm">
            <h3 className="text-lg font-bold text-ink mb-2">1. Carga de Videos (MP4)</h3>
            <p className="text-muted text-sm leading-relaxed">
              Todo comienza cuando se sube un archivo de video (<span className="text-brand font-medium">formato MP4</span>) desde la pantalla principal. Se puede arrastrarlo o hacer clic para seleccionarlo. El sistema lo envía al servidor (el "cerebro" de la aplicación) para comenzar a analizarlo.
            </p>
          </div>
        </div>

        {/* Paso 2 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-brand bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 bg-brand/10 text-brand z-10 transition-colors">
            <ServerCog size={20} />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-line bg-card shadow-sm">
            <h3 className="text-lg font-bold text-ink mb-2">2. Preparación (Preprocesamiento)</h3>
            <p className="text-muted text-sm leading-relaxed mb-2">
              Un video es como una libreta de dibujos que se pasa rápido. El servidor estandariza el video a <span className="text-ink font-medium">30 imágenes (frames) por segundo</span>.
            </p>
            <p className="text-muted text-sm leading-relaxed">
              Luego, para no perder ningún detalle, lo corta en pequeños <em>"mini-videos"</em> (clips) de apenas medio segundo de duración. Usa una técnica de <span className="font-medium text-ink">ventana temporal deslizante</span>, lo que significa que los cortes se superponen un poco, asegurando que si un evento importante ocurre justo a la mitad del corte, la IA no se lo pierda.
            </p>
          </div>
        </div>

        {/* Paso 3 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-brand bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 bg-brand/10 text-brand z-10 transition-colors">
            <BrainCircuit size={20} />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-line bg-card shadow-sm">
            <h3 className="text-lg font-bold text-ink mb-2">3. Análisis Inteligente (Redes Neuronales)</h3>
            <p className="text-muted text-sm leading-relaxed mb-2">
              Aquí ell sistema usa dos tipos de Inteligencia Artificial que trabajan en equipo:
            </p>
            <ul className="text-muted text-sm leading-relaxed list-disc list-inside ml-2 space-y-1">
              <li><strong>Los "Ojos" (R3D-18):</strong> Es un modelo experto en ver movimiento. Escanea los mini-videos y extrae las formas, siluetas y acciones físicas que están ocurriendo.</li>
              <li><strong>La "Memoria" (<span className="text-brand font-medium">LSTM</span>):</strong> Toma la información de los "Ojos" y la analiza como una historia continua. Al recordar lo que acaba de pasar un instante antes, comprende el <em>contexto</em> y determina si los movimientos corresponden a los de un asalto.</li>
            </ul>
          </div>
        </div>

        {/* Paso 4 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-brand bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 bg-brand/10 text-brand z-10 transition-colors">
            <TrendingUp size={20} />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-line bg-card shadow-sm">
            <h3 className="text-lg font-bold text-ink mb-2">4. Veredicto Final (Top-K Average)</h3>
            <p className="text-muted text-sm leading-relaxed mb-2">
              Si se sube un video de 5 minutos, probablemente un robo dure solo 10 segundos. Si se calculára el promedio de peligro de todo el video usando esos minutos de calma, la probabilidad bajaría tanto que el robo pasaría desapercibido.
            </p>
            <p className="text-muted text-sm leading-relaxed">
              Para solucionarlo se usa el <strong>Top-K Average</strong>. El sistema ignora los momentos de tranquilidad y se enfoca en promediar <span className="text-brand font-medium">solamente el 15% de los momentos más sospechosos</span> del video. Si ese 15% tiene una puntuación alta, el sistema lanza la alerta global de "Robo".
            </p>
          </div>
        </div>

        {/* Paso 5 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-brand bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 bg-brand/10 text-brand z-10 transition-colors">
            <MousePointerClick size={20} />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-line bg-card shadow-sm">
            <h3 className="text-lg font-bold text-ink mb-2">5. Resultados y Curva de Atención</h3>
            <p className="text-muted text-sm leading-relaxed mb-2">
              Finalmente, se verá en la pantalla una gráfica ondulada llamada <strong>Curva de Atención Temporizada</strong>. Esta curva sube como una montaña cuando el sistema detecta peligro y baja en zonas seguras.
            </p>
            <p className="text-muted text-sm leading-relaxed">
              <strong>¿Cómo interactuar?</strong> ¡Es muy sencillo! <span className="text-ink font-medium">Hacer clic en cualquier punto</span> de la gráfica. Inmediatamente el video que se encuentra arriba avanzará en el tiempo hasta ese segundo exacto. Esto te permite revisar rápidamente el evento sospechoso que la IA acaba de descubrir.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
