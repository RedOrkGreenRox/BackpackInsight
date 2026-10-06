# [Запуск Docker-окружения (run_docker.py)](../../scripts/run_docker.py)

## Назначение
Поднимает контейнеры проекта одним `docker-compose.yml` (Docker или Podman), затем проверяет, что сервисы отвечают по HTTP. При неудаче печатает хвост логов и выходит с кодом 1.

## Режим: локальный или серверный
- **`_requested_run_mode()`** — запрошенный режим: сначала аргументы `--server`/`--local`/`--auto`, затем `BACKPACK_DOCKER_MODE` и `BACKPACK_ENV` из окружения или `.env`. По умолчанию `auto`.
- **`_read_dotenv_value(key)`** — читает простое `KEY=value` из `.env` без раскрытия shell-синтаксиса.
- **`_detect_server_mode()`** — итог: явный режим побеждает; в `auto` серверный режим включают `ROOT_ENV=production` или `BACKPACK_ENV` = `server`/`production`/`prod`. Результат — константа `SERVER_MODE`.
- **`_apply_mode_env_defaults()`** — безопасные значения по умолчанию (`setdefault`, явные переменные не трогает): на сервере `BACKEND_BIND=0.0.0.0`, локально всё на `127.0.0.1` и фронтенд на порту `5080`; `POSTGRES_BIND` всегда `127.0.0.1`, `ROOT_DB_ENABLED=true`.
- **`compose_args()`** — `-f docker-compose.yml`. **`services_to_start()`** — `db backend` на сервере, `db backend web` локально. **`log_targets()`** — те же сервисы для логов.

## Движок контейнеров
- **`_detect_bazzite()`** — Bazzite или другая immutable Fedora: по `/etc/os-release` (`bazzite`, `silverblue`, `kinoite`, `aurora`) или по наличию `rpm-ostree`.
- **`_choose_engine()`** — `CONTAINER_ENGINE` переопределяет выбор; на Bazzite предпочитается `podman`, иначе `docker`, затем `podman`.
- **`compose_cmd()`** — команда compose, вычисляется один раз: `podman compose` → `podman-compose`; `docker compose` → `docker-compose` (или `sudo docker-compose`).
- **`check_engine()`** — шаг 1/3: `ENGINE info`; если Docker недоступен без прав, но работает `sudo -n docker info`, переключается на `sudo docker`. Иначе печатает подсказку и выходит.

## Запуск и проверки
- **`start_services()`** — шаг 2/3. При `PARANOID_MODE` удаляет контейнеры `backpack_insight_db`, `backpack_insight_backend`, `backpack_insight_web` (под Podman ещё и том `backpackinsight_postgres_data`) и ставит `CACHE_BUST` = текущее время. Затем `up -d --build` нужных сервисов и печатает адреса.
- **`wait_http(url, name, timeout, container)`** — опрашивает адрес раз в 2 с; любой ответ 200–499 считается успехом. Если контейнер упал (`container_running`), выходит досрочно.
- **`container_running(name)`** — точная проверка `inspect -f {{.State.Running}}`.
- **`describe_conn_error(err)`** — короткое объяснение сетевой ошибки (отказ соединения, HTTP-код, таймаут).
- **`tail_logs(service, lines)`** и **`show_logs()`** — хвост логов сервиса и подключение к логам (`FOLLOW_LOGS`).
- **`run_command(...)`** — обёртка над `subprocess.run` с UTF-8; при исключении возвращает `None`, вызывающий код это проверяет. **`step(...)`** — строка прогресса `[n/3]`.

## Точка входа
Применяет значения по умолчанию, проверяет движок, запускает сервисы и ждёт API на `http://localhost:8000/` (`BACKEND_TIMEOUT` = 180 с: миграции SQLx и проверка паков). Локально ещё ждёт Web на `FRONTEND_PORT` (`WEB_TIMEOUT` = 120 с).

## AI-контекст
- В начале файла stdout и stderr переводятся в UTF-8, иначе локализованные ошибки Windows печатаются «?????».
- Флаги `VERBOSE`, `PARANOID_MODE`, `FOLLOW_LOGS` меняются прямо в файле.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-06
