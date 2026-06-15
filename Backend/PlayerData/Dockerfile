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
# --workers 1 обязательно: ProfileFactory хранит кэш определений как состояние
# уровня класса; при нескольких воркерах кэш расщепляется (расхождение данных,
# неточная статистика hit/miss). Потокобезопасность внутри процесса обеспечена RLock.
# Бутстрап схемы вместо голого `alembic upgrade head`:
# на «старой» БД (том создан до Alembic) upgrade падал с "table already exists"
# и ронял весь старт (uvicorn не запускался, порт 8000 не открывался,
# restart: always зацикливал контейнер). bootstrap.py делает stamp head для
# таких БД и обычный upgrade для чистых/уже-мигрированных. См. Backend/DB/bootstrap.py.
CMD ["sh", "-c", "cd /app && python -m Backend.DB.bootstrap && cd /app/Backend/PlayerData && uvicorn api:app --host 0.0.0.0 --port 8000 --workers 1"]
