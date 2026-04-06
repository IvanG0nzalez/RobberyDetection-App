# Frontend de Análisis y Dashboard - Securify

Esta interfaz web es la cara visible e interactiva del sistema **Securify**. Está construida con **Next.js (React)** con el *App Router*, **TailwindCSS** para el estilizado y **Recharts** para visualizaciones de datos dinámicas.

---

## Decisiones Técnicas y Flujo de Trabajo (UX/UI)

### 1. Gestión de Videos y Carga en la Caché (`Uploader.tsx`)
Cuando el usuario proporciona un video `.mp4` (arrastrándolo o dándole clic), la web no solo encola el archivo en un `FormData` para enviarlo por HTTP al backend, sino que también se genera una instancia retenida en memoria mediante **`URL.createObjectURL(file)`**. 
Esta técnica previene re-descargas pesadas desde el servidor u operativas dobles. Tras enviarse, el reproductor de HTML5 final se alimentará estrictamente de este blob puro local.

### 2. Espera Asíncrona (`Skeletons.tsx`)
Ya que analizar fotograma a fotograma un video en un servidor usando Redes Neuronales puede tardar unos segundos, el Dashboard cambia su estado de renderizado a *Skeletons* (pantallas de carga genéricas con `animate-pulse` grisáceo). Dado que estos esqueletos poseen las mismas dimensiones de los resultados finales, se evita el tan odiado efecto "salto" de elementos o colapsos visuales (`Layout Shift`) al momento de poblarse de datos.

### 3. Dashboard Final y Visualizaciones (`PredictionCards.tsx`)
Tras obtener un `200 OK` del backend con el cálculo de probabilidad generado por el *Top-K Average Pooling*:
*   **Card Hero**: Señalará contundentemente el veredicto.
*   **Curva de Atención Interactiva (Recharts)**: Se inyecta la llave temporal `attention_curve` directamente a un componente gráfica de Área. La curva grafica el peligro del video segundo a segundo.
*   **Interacción y Sincronía Bidireccional**: 
    1. Una línea vertical (`ReferenceLine`) rastreará tu ubicación en la gráfica *mientras* el video subido se va reproduciendo (`onTimeUpdate`).
    2. Como atajo inverso, si el usuario da **clic sobre un pico sospechoso (montaña)** en la curva de atención de `Recharts`, un atajo matemático ajusta el `videoRef.current.currentTime`, provocando un salto inmediato del video al momento exacto del incidente.

### 4. Integración y Tematización de Data Science (`ReportIframe.tsx`)
Los reportes **HTML** generados en: **[IvanG0nzalez/RobberyDetection](https://github.com/IvanG0nzalez/RobberyDetection.git)** (`EDA.html`, `best_model.html`, etc.) fueron copiados directamente al proyecto y acoplados modularmente usando Iframes.
Gracias al hook `MutationObserver` y mensajes `postMessage`, Next.js logra inyectar forzosamente y sincronizar la temática Tailwind oscura/clara (Dark Mode) dentro de esos reportes HTML estáticos en tiempo real y sin necesidad de alterar los códigos base de Pandas o Jupyter.

---

## Estructura de Directorios Clave

```text
frontend/
├── app/                        # Rutas de la App (Next.js App Router)
│   ├── api/                    # API Routes locales (ej. servidor físico de HTML reports)
│   ├── acerca-de/              # Sección informativa estructurada con los reportes interactivos (EDA y Modelos)
│   ├── modo-de-uso/            # Documentación in-app enfocada en explicar el pipeline y top-k a usuarios no técnicos
│   ├── globals.css             # Paleta maestra de variables CSS para el enrutado Tailwind
│   ├── layout.tsx              # Componente envolvente global del visor root
│   └── page.tsx                # Punto de anclaje (Página "Analizar Video")
├── components/                 
│   ├── ui/                     # Componentes atómicos (DashboardLayout responsivo, ThemeToggle, Skeletons)
│   └── results/                # Vista orquestadora de los resultados (PredictionCards)
├── data/                       
│   └── reports/                # Exportaciones HTML locales servidas por la API local.
├── tailwind.config.ts          # Extensión del núcleo y mapeo de tokens (bg, card, brand, ink, línea, danger)
└── package.json                # Gestión de dependencias (Lucide-React, Recharts, Axios, etc.)
```

---

## Enrutamiento y Modo Móvil

Toda la aplicación es *responsive*. El componente maestro `DashboardLayout.tsx` cuenta con un sistema de estados modulares para expandir un **Sidebar con desenfoque de telón de fondo** (blur) en configuraciones de escritorio completas, o colapsarse al tamaño de íconos en interfaces reducidas, poseyendo además controles intuitivos (Menú de Sandwich) para dispositivos móviles usando los detectores preestablecidos de la librería de SVG `lucide-react`.
