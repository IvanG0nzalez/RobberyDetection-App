# Backend de Inferencia - Securify (Detección de Robos)

Este módulo es el núcleo analítico (API) del sistema Securify. Está construido con **FastAPI** y usa **PyTorch** para procesar videos en tiempo real, evaluando patrones de movimiento y determinando la probabilidad de que se trate de un asalto o robo.

---

## Origen del Modelo y su Configuración
El código y la configuración en inferencia reflejan los hallazgos de la última fase de la experimentación y validación métrica desarrollados en: **[IvanG0nzalez/RobberyDetection](https://github.com/IvanG0nzalez/RobberyDetection.git)**
*   **`models/lstm_model.pth`**: Este archivo contiene exclusivamente los pesos que lograron las mejores métricas de validación durante los experimentos previos (Best Model). 
*   **`config/config.json`**: Este archivo alberga los "mejores hiperparámetros" recuperados con librerías como Optuna durante el entrenamiento. Es decir, las configuraciones acá presentes no son aleatorias, sino que son la configuración matemática exacta que logró que el modelo convergiera de manera óptima.

---

## Estructura del Directorio

```text
backend/
├── app/                      # Lógica principal de FastAPI
│   ├── api/                  # Controladores y rutas
│   ├── core/                 # Inicialización y validación general de la app y PyTorch
│   ├── models/               # Definición pura de redes neuronales (LSTM + R3D)
│   ├── schemas/              # Modelos de Pydantic para validar entradas/salidas (requests/responses)
│   ├── services/             # Servicios pesados de negocio (Inferencia R3D -> LSTM -> Pooling)
│   └── utils/                # Utilidades delegadas (manejo de videos con OpenCV, decodificación, fragmentación)
├── config/                   
│   └── config.json           # Declaración de hiperparámetros y flags de ejecución del sistema
├── models/
│   └── lstm_model.pth        # Los pesos de red neuronal extraídos del mejor exprimento
├── temp/                     # Almacén de archivos crudos transitorios guardados durante el pipeline
├── requirements.txt          # Dependencias esenciales
└── run.py                    # Script de entrada para montar el servidor Uvicorn/FastAPI
```

---

## Configuración y Flags (`config.json`)

El archivo `config.json` actúa como el centro de mando del backend. Aquí se delinean sus dimensiones y acciones operativas.

### 1. Hiperparámetros de la Red (Fijados por el Mejor Modelo)
*   **`clip_length` (16)**: Dicta que cada mini-video de entrada a la red tomará 16 fotogramas estandarizados.
*   **`frame_size` (112)**: Relación de aspecto cuadrado en píxeles al que serán encogidas las imágenes.
*   **`input_size` (512)**: Tamaño del vector o de características resultante una vez atravesada la arquitectura de extracción de la ResNet-18 3D.
*   **`hidden_size` (192)**: Es el número de neuronas del estado oculto interno dictaminado por la optimización de la LSTM.
*   **`num_layers` (2)**: Niveles de profundidad recurrentes con los que la LSTM fue configurada.
*   **`bidirectional` (true)**: Capacidad de analizar en dos direcciones (pasado-futuro, futuro-pasado) que demostró mejores métricas.
*   **`use_attention` (true)**: Si es verdadero, invoca a una capa de atención responsable de darle más "puntaje" a comportamientos que resalten temporalmente.

### 2. Reglas del Procesamiento del Video e Inferencia
*   **`max_segments_per_video` (32)**: Configuración remanente del dimensionamiento estricto si no es procesado completo.
*   **`process_full_video` (true)**: **Flag fundamental**. Si está en verdadero, el backend obvia los límites antiguos e inicializa una **ventana deslizante** masiva sobre todo el video cargado de principio a fin, fraccionándolo en lotes (batches), prediciéndolos y obteniendo una consolidación global de un solo reporte interactivo.
*   **`overlapping` (true) y `stride` (8)**: Controlan la ventana deslizante. Por ejemplo, si el clip es de 16 frames, un stride de 8 indica que saltará moviéndose frame tras frame hasta 8 (sobrescribiendo los segundos 8). Evita perdernos la acción asimétrica si el golpe llega en la frontera de dos clips.

### 3. Configuraciones Locales
*   **`classification_threshold` (0.5)**: Si tras evaluar los lotes el promedio resultante supera `0.5`, se considera "Robbery" o Anomalía positiva en el dictamen final. De lo contrario, cae en normalidad.
*   **`keep_temp_files` (true)**: Flag que altera el comportamiento en memoria del backend. Si está habilitado, los videos MP4 guardados temporalmente en `temp/` para fragmentarlos no serán borrados tras completar el reporte. Ayuda a depurar videos sin tener que enviarlos repetidas veces.
*   **`preprocessing` (`mean`, `std`)**: Vectores de promedios provenientes de las normativas de la base de datos Kinetics-400 para normalizar los tensores y acoplar los colores consistentemente de forma previa a insertarlos a la red preentrenada.

---

## Flujo Lógico de Inferencia (Funcionamiento general)

Cuando se envía un archivo de video temporal desde el frontend a la ruta local (e.g. `POST /api/analyze`), el servidor realiza exactamente la siguiente trayectoria operativa:

1. **Recepción y Cacheado**: Se descarga el video estático a lado de la carpeta de trabajo `temp/` dictada por la app.
2. **Estandarización y Fragmentación (`utils/clips.py` & `video.py`)**: Automáticamente, CV2 abre el video y unifica la sincronía extrayendo todo el crudo a `30 FPS`. Aprovechando el uso del *stride* y el *overlapping*, se fragmenta todo el corpus del video en segmentos consecutivos (`clips`), acoplándolos en un tensor de la manera *[Batches, Canales, Profundidad (frames), Altura, Anchura]* preprocesado usando sus normas (`mean`, `std`).
3. **Visión (R3D-18)**: Estos tensores masivos son enviados a una ResNet 3D para extraer exclusivamente las singularidades corporales, descartando información redundante. El resultado de extraer cada tensor genera embeddings matemáticos encapsulados de longitud configurada (`input_size`).
4. **Razonamiento (LSTM Batching)**: La secuencia matemática cronológica que resultó del ojo 3D, ingresa segmentadamente junto a su función de atención y memoria a largo plazo LSTM, generando localmente una asignación final probabilística (`[0.0 a 1.0]`) sobre qué tanto este fragmento está ligado a comportamientos ilícitos.
5. **Decisión de Agregación Global (Top-K Average Pooling)**: En lugar de hacer un promedio normal con todo el video y ahogar/diluir dramáticamente la probabilidad del crimen entre la suma de cientos de fragmentos "tranquilos" del video entero, el backend filtra y aísla sólo el **15%** de los *clips* con mayor índice probable de asalto de toda la trama. El puntaje del evento global se realiza promediando este Top 15% excluyente.
6. **Retorno de la Curva**: Retorna un reporte transaccional JSON enrutado junto a la rama cronológica `attention_curve` que el cliente web decodificará para proveer la curva interactiva.
