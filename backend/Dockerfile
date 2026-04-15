# Imagen base oficial de Python
FROM python:3.10-slim

# Variables de entorno para que Python no genere .pyc y envíe la salida directamente a stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Instalar las dependencias del sistema necesarias
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces requiere configuraciones de un usuario no root (UID 1000)
RUN useradd -m -u 1000 user

# Cambiar al usuario no root
USER user

# Configurar el directorio home y el PATH
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR $HOME/app

# Copiar el archivo de requerimientos e instalar las dependencias
COPY --chown=user requirements.txt $HOME/app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar todo el contenido del backend al directorio de trabajo con sus respectivos permisos
COPY --chown=user . $HOME/app/

# Asegurar la existencia del directorio temp para evitar problemas de escritura
RUN mkdir -p $HOME/app/temp

# Hugging Face Spaces por defecto espera que la aplicación escuche en el puerto 7860
EXPOSE 7860

# Comando para arrancar el servidor FastAPI usando uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
