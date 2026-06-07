FROM python:3.13-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Корень /app позволяет делать `from Backend.PlayerData...`
ENV PYTHONPATH=/app

# 1. Только requirements — кешируем слой зависимостей
COPY Backend/PlayerData/requirements.txt /app/Backend/PlayerData/requirements.txt
RUN pip install --no-cache-dir --retries 10 -r Backend/PlayerData/requirements.txt

# 2. Копируем весь Backend (модели, миграции, данные)
COPY Backend /app/Backend
# Alembic-конфиг должен быть в рабочей директории, откуда запускается команда
COPY alembic.ini /app/alembic.ini

EXPOSE 8000

# Перед запуском приложения накатываем миграции.
# Если БД пустая — создастся всё с нуля. Если уже накачена — alembic ничего не сделает.
CMD ["sh", "-c", "cd /app && alembic upgrade head && cd /app/Backend/PlayerData && uvicorn api:app --host 0.0.0.0 --port 8000"]
