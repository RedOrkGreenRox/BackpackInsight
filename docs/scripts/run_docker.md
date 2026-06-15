# [Запуск Docker-окружения (run_docker.py)](../../scripts/run_docker.py)

## Назначение
Оркестратор локального/серверного запуска через docker compose: чистит старые контейнеры, собирает и поднимает сервисы, ждёт health-check и (опционально) показывает логи. Принудительно использует UTF-8 для консоли (фикс кракозябр на Windows).

## Подробное описание
*   **Кодировка**: при старте `sys.stdout/stderr.reconfigure(encoding="utf-8", errors="replace")` — иначе локализованные ошибки ОС (напр. `WinError 10061` на русской Windows) печатаются в cp1251 и превращаются в «?????». Все `subprocess.run` тоже читаются как UTF-8.
*   **Флаги**: `SERVER_MODE`, `VERBOSE`, `PARANOID_MODE` (пересборка с нуля), `FOLLOW_LOGS`.
*   **Таймауты**: `BACKEND_TIMEOUT=180` и `WEB_TIMEOUT=60`. Бэкенду нужно больше времени: перед открытием порта 8000 он выполняет `alembic upgrade head` и `_sync_static_data()` (загрузка ~1100 предметов + SHA-256 + синхронизация БД), см. [api.py](../backend/playerdata/api.md). Раннее «connection refused» — это ещё не открытый порт, а не падение.

## Ключевые функции
*   `check_docker()` — проверка, что демон Docker запущен.
*   `compose_cmd()` — выбирает `docker compose` (новый CLI) или `docker-compose` (fallback).
*   `start_services()` — очистка (в PARANOID), `up -d --build`, вывод адресов.
*   `wait_http(url, name, timeout, container)` — поллинг URL с прогрессом; если указанный контейнер упал — прекращает ожидание досрочно.
*   `container_running(name)` — `docker inspect` состояния контейнера.
*   `describe_conn_error(err)` — короткое **ASCII-безопасное** объяснение сетевой ошибки (не печатает сырую строку ОС).
*   `tail_backend_logs()` — хвост логов бэкенда при провале health-check.
*   `run_command(...)` — обёртка shell-команд (UTF-8, управление выводом).

## Связи (Dependencies)
*   [docker-compose.yml](../docker-compose.md) / [docker-compose.server.yml](../docker-compose.server.md) в корне проекта.
*   Поднимаемый бэкенд: [api.py](../backend/playerdata/api.md) (lifespan + миграции); веб: [server.ts](../frontend/server.md).

## AI-контекст
*   Режимы переключаются константами вверху файла. `PARANOID_MODE=True` форсирует полную пересборку — медленнее, но чище.
*   Если health-check бэкенда падает по таймауту, а контейнер `backpack_insight_backend` жив — почти всегда дело в первом долгом старте (миграции/синхронизация/`pip install`); увеличьте `BACKEND_TIMEOUT` или смотрите `tail_backend_logs()`.
*   Скрипт возвращает ненулевой код при провале — удобно для CI.

---

> 📌 **Подпись документации:** актуализировано вместе с правкой run_docker.py (UTF-8 + увеличенный таймаут backend).
