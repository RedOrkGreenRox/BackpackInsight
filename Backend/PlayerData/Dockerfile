FROM python:3.13-slim

WORKDIR /app

# Настройка окружения
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Путь /app позволяет импортировать модули из Backend.PlayerData
ENV PYTHONPATH=/app

# 1. Копируем только файл зависимостей для кэширования слоя
COPY Backend/PlayerData/requirements.txt /app/Backend/PlayerData/requirements.txt
RUN pip install --no-cache-dir --retries 10 -r Backend/PlayerData/requirements.txt

# 2. Копируем папку Backend
COPY Backend /app/Backend

# 3. Устанавливаем рабочую директорию, где лежит api:app
WORKDIR /app/Backend/PlayerData

EXPOSE 8000

# Запуск через uvicorn
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]