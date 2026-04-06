# Securify - Plataforma de Detección de Robos en Video (Producción)

Este repositorio contiene una implementación (Backend y Frontend) del sistema **Securify**, una plataforma inteligente diseñada para detectar anomalías y robos en videos de cámaras de seguridad utilizando Inteligencia Artificial.

---

## Origen de los Modelos y Datos (MLOps)

Todo el motor cerebral de esta aplicación, incluyendo los pesos del modelo de Deep Learning, los hiperparámetros optimizados y los reportes de análisis de datos, **no fueron generados empíricamente en este repositorio**.

Son el resultado extraído directamente del repositorio:
**[IvanG0nzalez/RobberyDetection](https://github.com/IvanG0nzalez/RobberyDetection)**

Elementos importados desde el repositorio de experimentación:
1. **Archivo de Pesos (`models/lstm_model.pth`)**: Obtenido del "Mejor Experimento" tras múltiples iteraciones validando la arquitectura combinada de ResNet-18 3D (R3D) y LSTM.
2. **Configuración de Red (`config/config.json`)**: Contiene los hiperparámetros óptimos (tamaño de ventana, `stride`, unidades ocultas, `bidirectional`, etc.) hallados mediante frameworks de optimización como Optuna.
3. **Reportes Interactivos (`frontend/data/reports/`)**: Archivos HTML estáticos generados por Jupyter y Pandas Profiling durante las fases de EDA (Análisis Exploratorio de Datos) y comparación de métricas, los cuales son servidos visualmente por la web.

---

## Arquitectura del Sistema

El proyecto está desacoplado en dos capas principales

### 1. Backend (FastAPI + PyTorch)
Es el motor analítico. Se encarga de recibir los videos, decodificarlos uniformemente a 30 FPS y pasarlos por un pipeline de Inferencia Profunda:
*   **Visión Espacio-Temporal (R3D-18)**: Extrae características puras de los fotogramas en movimiento, omitiendo factores de ruido.
*   **Contexto y Memoria (LSTM con Atención)**: Analiza secuencialmente las extracciones de la R3D y evalúa el comportamiento a lo largo del tiempo.
*   **Top-K Average Pooling**: En lugar de diluir la probabilidad de amenaza promediando minutos enteramente pacíficos, la API aísla matemáticamente y promedia el **15% de los fragmentos más sospechosos**, dictaminando un alto grado de precisión sobre robos fugaces y retornando la curva temporal de atención.

### 2. Frontend (Next.js + TailwindCSS + Recharts)
Interfaz de usuario moderna y reactiva bajo arquitectura SPA y App Router.
*   **Análisis Interactivo**: Permite la carga local de archivos `.mp4` gestionados directamente desde la caché del navegador (`Blob URL`) sin hacer retenciones dobles en red.
*   **Curva de Atención Dinámica**: Dibuja la respuesta cronológica del Backend. Con un simple **clic en los picos altos de la gráfica**, el reproductor de video de HTML5 salta (seeking) al segundo exacto de la ocurrencia del incidente, brindando auditoría visual inmediata.
*   **Aislamiento CSS de Reportes**: Los iframes inyectan dinámicamente propiedades del modo oscuro/claro (Dark Mode) de Tailwind hacia los reportes analíticos de Jupyter extraídos del repositorio principal.

---

## Instalación y Ejecución Local

Para levantar el entorno completo, se debe ejecutar ambos servidores en paralelo.

### Backend (Python)
Requiere Python 3.9+ e idealmente soporte para CUDA si se dispone de GPU dedicada.

```bash
cd backend
# 1. Crear entorno virtual (Recomendado)
python -m venv venv
source venv/Scripts/activate  # En Windows
# source venv/bin/activate    # En Linux/Mac

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Levantar la API REST
python run.py
```
El servidor backend estará disponible en: `http://localhost:8000`

### Frontend (Node.js)
Requiere Node.js 18+.

```bash
cd frontend
# 1. Instalar paquetes NPM
npm install

# 2. Levantar el entorno de desarrollo web
npm run dev
```
El Dashboard interactivo estará disponible en: `http://localhost:3000`

---

## Tecnologías Utilizadas
*   **Inteligencia Artificial**: PyTorch, TorchVision, OpenCV, NumPy.
*   **Backend**: FastAPI, Uvicorn, Pydantic.
*   **Frontend**: React 18, Next.js (App Router), TailwindCSS, Recharts, Lucide-React.
