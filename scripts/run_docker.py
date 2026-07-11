import subprocess
import sys
import os
import time
import shutil
from pathlib import Path
from urllib.request import urlopen
from urllib.error import URLError, HTTPError


# ---------------------------------------------------------------------------
# UTF-8 enforcement
# Без этого локализованные ошибки ОС (например, WinError 10061 на русской
# Windows) печатаются в cp1251 и превращаются в "?????...".
# ---------------------------------------------------------------------------
for _stream_name in ("stdout", "stderr"):
    _stream = getattr(sys, _stream_name, None)
    try:
        if _stream is not None and hasattr(_stream, "reconfigure"):
            _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


# ---------------------------------------------------------------------------
# Конфигурация
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DOCKER_COMPOSE_FILE = PROJECT_ROOT / "docker-compose.yml"


def _read_dotenv_value(key: str) -> str | None:
    """Reads a simple KEY=value from .env without expanding shell syntax."""
    dotenv = PROJECT_ROOT / ".env"
    try:
        lines = dotenv.read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return None
    for raw in lines:
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, value = line.split("=", 1)
        if name.strip() == key:
            return value.strip().strip('"').strip("'")
    return None


def _requested_run_mode() -> str:
    """local/server/auto from CLI, env, or .env. CLI has priority."""
    for arg in sys.argv[1:]:
        normalized = arg.strip().lower()
        if normalized in ("--server", "server"):
            return "server"
        if normalized in ("--local", "local"):
            return "local"
        if normalized in ("--auto", "auto"):
            return "auto"

    for key in ("BACKPACK_DOCKER_MODE", "BACKPACK_ENV"):
        value = os.environ.get(key) or _read_dotenv_value(key)
        if value and value.strip().lower() in ("server", "production", "prod"):
            return "server"
        if value and value.strip().lower() in ("local", "development", "dev"):
            return "local"
        if value and value.strip().lower() == "auto":
            return "auto"

    return "auto"


def _detect_server_mode() -> bool:
    """
    Compose itself cannot safely infer local/server. The script owns detection.
    Explicit --server/--local or BACKPACK_DOCKER_MODE always wins.
    In auto mode, production markers in env/.env select server; otherwise local.
    """
    requested = _requested_run_mode()
    if requested == "server":
        return True
    if requested == "local":
        return False

    root_env = (os.environ.get("ROOT_ENV") or _read_dotenv_value("ROOT_ENV") or "").lower()
    backpack_env = (os.environ.get("BACKPACK_ENV") or _read_dotenv_value("BACKPACK_ENV") or "").lower()
    if root_env == "production" or backpack_env in ("server", "production", "prod"):
        return True
    return False


SERVER_MODE   = _detect_server_mode()  # True — серверный режим, False — локальный


def _apply_mode_env_defaults() -> None:
    """Sets safe compose defaults. Explicit env/.env values still win."""
    if SERVER_MODE:
        os.environ.setdefault("ROOT_ENV", "production")
        os.environ.setdefault("BACKEND_BIND", "0.0.0.0")
        os.environ.setdefault("POSTGRES_BIND", "127.0.0.1")
    else:
        os.environ.setdefault("ROOT_ENV", "development")
        os.environ.setdefault("BACKEND_BIND", "127.0.0.1")
        os.environ.setdefault("POSTGRES_BIND", "127.0.0.1")
        os.environ.setdefault("FRONTEND_BIND", "127.0.0.1")
        os.environ.setdefault("FRONTEND_PORT", "5080")
    os.environ.setdefault("ROOT_DB_ENABLED", "true")


def compose_args() -> str:
    return f"-f {DOCKER_COMPOSE_FILE.name}"


def services_to_start() -> str:
    return "db backend" if SERVER_MODE else "db backend web"


def log_targets() -> str:
    return "backend db" if SERVER_MODE else "web backend db"


VERBOSE       = True   # True — подробный вывод
PARANOID_MODE = True   # True — пересобрать с нуля, False — быстрый старт
FOLLOW_LOGS   = False  # True — цепляться к логам после запуска

# Таймауты health-check (сек).
# Backend применяет SQLx migrations и проверяет FlatBuffer packs перед готовностью.
BACKEND_TIMEOUT = 180
WEB_TIMEOUT = 120


# ---------------------------------------------------------------------------
# Определение движка контейнеров: Podman или Docker
# ---------------------------------------------------------------------------

def _detect_bazzite() -> bool:
    """True если система — Bazzite или другой immutable Fedora-based дистрибутив."""
    try:
        text = Path("/etc/os-release").read_text(encoding="utf-8", errors="replace").lower()
        if any(k in text for k in ("bazzite", "silverblue", "kinoite", "aurora")):
            return True
    except OSError:
        pass
    # Наличие rpm-ostree — надёжный признак immutable Fedora
    return shutil.which("rpm-ostree") is not None


def _choose_engine() -> str:
    """Возвращает 'podman' или 'docker'. Можно переопределить через CONTAINER_ENGINE."""
    override = os.environ.get("CONTAINER_ENGINE", "").strip().lower()
    if override in ("podman", "docker"):
        return override

    if _detect_bazzite():
        return "podman" if shutil.which("podman") else "docker"

    # Обычная система: docker → podman → fallback docker
    return "docker" if shutil.which("docker") else ("podman" if shutil.which("podman") else "docker")


ENGINE: str   = _choose_engine()
IS_PODMAN: bool = ENGINE == "podman"

# Кеш команды compose — вычисляется один раз
_COMPOSE_CMD: str | None = None


# ---------------------------------------------------------------------------
# Утилиты
# ---------------------------------------------------------------------------

def run_command(
    command: str,
    cwd: Path = PROJECT_ROOT,
    capture_output: bool = False,
    silent: bool = False,
) -> subprocess.CompletedProcess | None:
    """
    Запускает shell-команду. Возвращает CompletedProcess или None при исключении.
    Вызывающий код ОБЯЗАН проверять на None перед обращением к .returncode.
    """
    try:
        if silent and not VERBOSE:
            result = subprocess.run(
                command, cwd=cwd, shell=True, check=False,
                stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
                text=True, encoding="utf-8", errors="replace",
            )
            if result.returncode != 0 and result.stderr:
                print(f"\n[CRITICAL ERROR in `{command}`]:\n{result.stderr}")
            return result

        return subprocess.run(
            command, cwd=cwd, shell=True, check=False,
            capture_output=capture_output,
            text=True, encoding="utf-8", errors="replace",
        )
    except Exception as e:
        print(f"[ERROR] Не удалось выполнить команду `{command}`: {e}")
        return None


def describe_conn_error(err) -> str:
    """Короткое ASCII-безопасное объяснение сетевой ошибки."""
    reason = getattr(err, "reason", err)
    errno_ = getattr(reason, "errno", None)
    win    = getattr(reason, "winerror", None)
    if win == 10061 or errno_ in (61, 111):
        return "connection refused (порт ещё не открыт — сервис ещё запускается)"
    if isinstance(err, HTTPError):
        return f"HTTP {err.code}"
    if isinstance(err, TimeoutError) or errno_ == 110:
        return "timeout (нет ответа)"
    return f"{type(err).__name__}: {getattr(reason, 'strerror', '') or 'нет соединения'}"


def step(n: int, total: int, msg: str, done: bool = False) -> None:
    suffix = "OK" if done else ""
    end    = "\n" if done else "\r"
    print(f"[{n}/{total}] {msg}... {suffix}", end=end, flush=True)


# ---------------------------------------------------------------------------
# Compose-команда (кешируется)
# ---------------------------------------------------------------------------

def compose_cmd() -> str:
    """
    Возвращает итоговую команду compose — вычисляется один раз.

    Podman:  'podman compose'  (встроен с v4+)  →  'podman-compose' (пакет)
    Docker:  'docker compose'  →  'docker-compose' (legacy)
    Если Docker требует sudo, check_engine() переписывает ENGINE в 'sudo docker'.
    """
    global _COMPOSE_CMD
    if _COMPOSE_CMD is not None:
        return _COMPOSE_CMD

    if IS_PODMAN:
        res = run_command("podman compose version", capture_output=True, silent=True)
        if res and res.returncode == 0:
            _COMPOSE_CMD = "podman compose"
        elif shutil.which("podman-compose"):
            _COMPOSE_CMD = "podman-compose"
        else:
            print(
                "[ERROR] Не найден `podman compose` или `podman-compose`.\n"
                "  Установите: rpm-ostree install podman-compose  (затем перезагрузитесь)\n"
                "  или:        pip install podman-compose"
            )
            sys.exit(1)
    else:
        res = run_command(f"{ENGINE} compose version", capture_output=True, silent=True)
        if res and res.returncode == 0:
            _COMPOSE_CMD = f"{ENGINE} compose"
        elif ENGINE.startswith("sudo "):
            _COMPOSE_CMD = "sudo docker-compose"
        else:
            _COMPOSE_CMD = "docker-compose"

    return _COMPOSE_CMD


# ---------------------------------------------------------------------------
# Шаги запуска
# ---------------------------------------------------------------------------

def check_engine() -> None:
    """Проверяет доступность выбранного движка контейнеров."""
    global ENGINE, _COMPOSE_CMD

    label = "Podman" if IS_PODMAN else "Docker"
    step(1, 3, f"Checking {label} ({ENGINE})")

    res = run_command(f"{ENGINE} info", capture_output=True, silent=True)
    if (res is None or res.returncode != 0) and not IS_PODMAN:
        sudo_res = run_command("sudo -n docker info", capture_output=True, silent=True)
        if sudo_res is not None and sudo_res.returncode == 0:
            ENGINE = "sudo docker"
            _COMPOSE_CMD = None
            res = sudo_res

    if res is None or res.returncode != 0:
        print(f"\n[ERROR] {label} недоступен или не запущен!")
        if IS_PODMAN:
            print("  Попробуйте: systemctl --user start podman.socket")
        else:
            print("  Запустите Docker Desktop/daemon или дайте пользователю доступ к docker.sock.")
            print("  Если доступен passwordless sudo, скрипт использует `sudo docker` автоматически.")
        sys.exit(1)

    step(1, 3, f"Checking {label} ({ENGINE})", done=True)


def start_services() -> None:
    step(2, 3, "Starting Services")

    label = "Podman" if IS_PODMAN else "Docker"
    mode  = "SERVER MODE" if SERVER_MODE else "LOCAL MODE"
    print(f"   - Engine: {label} ({ENGINE})")
    print(f"   - Mode:   {mode} → {DOCKER_COMPOSE_FILE.name}")
    print(f"   - Bind:   backend={os.environ.get('BACKEND_BIND')} postgres={os.environ.get('POSTGRES_BIND')}")
    if not SERVER_MODE:
        print(f"   - Web:    frontend={os.environ.get('FRONTEND_BIND')}:{os.environ.get('FRONTEND_PORT')}")

    if PARANOID_MODE:
        containers = [
            "backpack_insight_db",
            "backpack_insight_backend",
            # Always remove stale local frontend too; server mode must leave no web container running.
            "backpack_insight_web",
        ]
        print("   - [PARANOID] Cleaning containers...", end="\r", flush=True)
        for c in containers:
            run_command(f"{ENGINE} rm -f {c}", silent=True)
        # При Podman также чистим volume чтобы не осталось испорченных данных PG
        if IS_PODMAN:
            run_command("podman volume rm -f backpackinsight_postgres_data", silent=True)
        print("   - [PARANOID] Cleaning containers... DONE")
    else:
        print("   - Fast Start Mode (skipping cleanup)")

    os.environ["CACHE_BUST"] = str(int(time.time()) if PARANOID_MODE else 1)

    print("   - Initializing Containers (build & up)...", flush=True)
    cmd_up = f"{compose_cmd()} {compose_args()} up -d --build {services_to_start()}"
    res_up = run_command(cmd_up, silent=not VERBOSE)

    # Проверяем None — run_command может вернуть None при исключении
    if res_up is None or res_up.returncode != 0:
        print("\n[ERROR] Не удалось запустить контейнеры.")
        print("  Совет: установите PARANOID_MODE = True для полного пересоздания.")
        sys.exit(1)

    print("   - Initializing Containers... DONE")
    print("\nServices Started!")
    print("   - API:     http://localhost:8000")
    if not SERVER_MODE:
        frontend_port = os.environ.get("FRONTEND_PORT") or _read_dotenv_value("FRONTEND_PORT") or "5080"
        print(f"   - Web:     http://localhost:{frontend_port}")
    db_port = os.environ.get("POSTGRES_PORT") or _read_dotenv_value("POSTGRES_PORT") or "5432"
    print(f"   - DB Port: localhost:{db_port} (bound to POSTGRES_BIND)")
    print()


def container_running(name: str) -> bool:
    """Точная проверка статуса контейнера (без ложных срабатываний на подстроку)."""
    res = run_command(
        f'{ENGINE} inspect -f "{{{{.State.Running}}}}" {name}',
        capture_output=True, silent=True,
    )
    if res is None or res.returncode != 0:
        return False
    return (res.stdout or "").strip().lower() == "true"


def wait_http(url: str, name: str, timeout: int, container: str | None = None) -> bool:
    """Ждёт HTTP-ответа. Досрочно выходит если контейнер упал."""
    deadline   = time.time() + timeout
    last_error = None
    waited     = 0

    while time.time() < deadline:
        if container and waited > 5 and not container_running(container):
            print(" " * 60, end="\r")
            print(f"   - Health check FAILED: {name} — контейнер '{container}' упал.")
            return False
        try:
            with urlopen(url, timeout=3) as resp:
                status = getattr(resp, "status", 200)
                if 200 <= status < 500:
                    print(" " * 60, end="\r")
                    print(f"   - Health check OK: {name} ({url}) -> {status}")
                    return True
        except (URLError, HTTPError, TimeoutError, OSError) as e:
            last_error = e

        waited += 2
        print(f"   - Ожидание {name}... {waited}s/{timeout}s", end="\r", flush=True)
        time.sleep(2)

    print(" " * 60, end="\r")
    print(f"   - Health check FAILED: {name} ({url})")
    if last_error is not None:
        print(f"     Причина: {describe_conn_error(last_error)}")
    return False


def tail_logs(service: str, lines: int = 40) -> None:
    """Печатает хвост логов любого сервиса."""
    print(f"\n--- Последние {lines} строк логов [{service}] ---")
    run_command(f"{compose_cmd()} {compose_args()} logs --tail {lines} {service}")
    print(f"--- конец логов [{service}] ---")


def show_logs() -> None:
    step(3, 3, "Attaching to logs")
    print("-------------------------------------------------------")
    print("Press Ctrl+C to stop watching logs (app continues running)")
    print("-------------------------------------------------------")
    targets = log_targets()
    try:
        subprocess.run(
            f"{compose_cmd()} {compose_args()} logs -f {targets}",
            cwd=PROJECT_ROOT, shell=True,
        )
    except KeyboardInterrupt:
        print("\n[Logs] Detached. Containers are still running.")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    label = "Podman" if IS_PODMAN else "Docker"
    _apply_mode_env_defaults()
    print(f"[init] Container engine: {label} ({ENGINE})")
    print(f"[init] Run mode: {'server' if SERVER_MODE else 'local'} (request: {_requested_run_mode()})")
    if IS_PODMAN and _detect_bazzite():
        print("[init] Bazzite / immutable Fedora detected — using Podman automatically.")
    print()

    check_engine()
    start_services()

    step(3, 3, "Running health checks")
    print(
        f"   (backend поднимается дольше: SQLx migrations + pack verification, "
        f"лимит {BACKEND_TIMEOUT}s)"
    )

    ok_api = wait_http(
        "http://localhost:8000/", "API",
        BACKEND_TIMEOUT, container="backpack_insight_backend",
    )
    if SERVER_MODE:
        ok_web = True
    else:
        frontend_port = os.environ.get("FRONTEND_PORT") or _read_dotenv_value("FRONTEND_PORT") or "5080"
        ok_web = wait_http(
            f"http://localhost:{frontend_port}/", "Web",
            WEB_TIMEOUT, container="backpack_insight_web",
        )

    if FOLLOW_LOGS:
        show_logs()
    else:
        print("-------------------------------------------------------")
        if ok_api and ok_web:
            print("Startup checks passed. Containers continue running in background.")
        else:
            print("Startup checks failed. Проверьте логи контейнеров:")
            print(f"  {compose_cmd()} {compose_args()} logs -f {log_targets()}")
            if not ok_api:
                tail_logs("backend")
            if not ok_web and not SERVER_MODE:
                tail_logs("web")
        print("-------------------------------------------------------")

    if not (ok_api and ok_web):
        sys.exit(1)
