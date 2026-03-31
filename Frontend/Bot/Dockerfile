# Используем официальный Python образ
FROM python:3.11-slim

# Установка рабочих переменных
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV WORKDIR=/app

# Создание рабочей директории
WORKDIR $WORKDIR

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Копирование и установка Python зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование исходного кода
COPY src/ ./src/
COPY config/ ./config/

# Создание необходимых директорий
RUN mkdir -p logs data

# Установка прав доступа
RUN chmod +x src/main.py

# Открытие портов (если нужен веб-интерфейс)
EXPOSE 8080

# Команда запуска
CMD ["python", "src/main.py"]
