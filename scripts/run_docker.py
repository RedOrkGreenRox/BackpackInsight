import subprocess
import sys
import os
import time
from pathlib import Path
from urllib.request import urlopen
from urllib.error import URLError, HTTPError

# --- UTF-8 enforcement (fix Windows cp1251 mojibake in console) ---
# Без этого локализованные ошибки ОС (например, WinError 10061 на русской Windows)
# печатаются в cp1251 и превращаются в "?????...". Принудительно переводим
# stdout/stderr в UTF-8 и просим Python не падать на неотображаемых символах.
for _stream_name in ("stdout", "stderr"):
    _stream = getattr(sys, _stream_name, None)
    try:
        if _stream is not None and hasattr(_stream, "reconfigure"):
            _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# --- Configuration ---
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DOCKER_COMPOSE_FILE = PROJECT_ROOT / "docker-compose.yml"
DOCKER_COMPOSE_SERVER_FILE = PROJECT_ROOT / "docker-compose.server.yml"

# --- Settings ---
SERVER_MODE = False   # True — серверный режим, False — локальный режим
VERBOSE = True        # True — подробный вывод, False — тихий режим
PARANOID_MODE = True  # True — пересобрать с нуля, False — быстрый запуск
FOLLOW_LOGS = False   # True — сразу цепляться к логам, False — завершать скрипт после health-check

# Таймауты health-check (сек).
# Бэкенд перед открытием порта 8000 выполняет `alembic upgrade head` и
# _sync_static_data() (загрузка ~1100 предметов + SHA-256 + синхронизация БД),
# а при первой сборке ещё и `pip install`. Поэтому ему нужно заметно больше
# времени, чем веб-серверу. Раннее "connection refused" — это НЕ падение,
# а ещё не открытый порт (lifespan FastAPI стартует до приёма запросов).
BACKEND_TIMEOUT = 180  # было 30 — не хватало на миграции + синхронизацию статики
WEB_TIMEOUT = 60


def run_command(command, cwd=PROJECT_ROOT, capture_output=False, silent=False):
    """Runs a shell command and manages output visibility."""
    try:
        if silent and not VERBOSE:
            result = subprocess.run(
                command, cwd=cwd, shell=True, check=False,
                stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
                text=True, encoding="utf-8", errors="replace",
            )
            if result.returncode != 0 and result.stderr:
                print(f"\n[CRITICAL ERROR in {command}]:\n{result.stderr}")
            return result

        result = subprocess.run(
            command, cwd=cwd, shell=True, check=False,
            capture_output=capture_output, text=True,
            encoding="utf-8", errors="replace",
        )
        return result
    except Exception as e:
        print(f"Error running command '{command}': {e}")
        return None


def describe_conn_error(err) -> str:
    """
    Короткое ASCII-безопасное объяснение сетевой ошибки.
    Не печатаем сырую локализованную строку ОС (она ломает кодировку на Windows).
    """
    reason = getattr(err, "reason", err)
    errno = getattr(reason, "errno", None)
    win = getattr(reason, "winerror", None)
    if win == 10061 or errno in (61, 111):
        return "connection refused (порт ещё не открыт — сервис, вероятно, ещё запускается)"
    if isinstance(err, HTTPError):
        return f"HTTP {err.code}"
    if isinstance(err, TimeoutError) or errno == 110:
        return "timeout (нет ответа)"
    return f"{type(err).__name__}: {getattr(reason, 'strerror', '') or 'нет соединения'}"


def check_docker():
    print("[1/3] Checking Docker...", end="\r")
    res = run_command("docker info", capture_output=True, silent=True)
    if res.returncode != 0:
        print("\n[ERROR] Docker is not running! Please start Docker Desktop.")
        sys.exit(1)
    print("[1/3] Checking Docker... OK")


def compose_cmd():
    """Возвращает 'docker compose' (новый CLI) или 'docker-compose' (fallback)."""
    res = run_command("docker compose version", capture_output=True, silent=True)
    return "docker compose" if (res and res.returncode == 0) else "docker-compose"


def start_services():
    print("[2/3] Starting Services...")

    compose_file = DOCKER_COMPOSE_SERVER_FILE if SERVER_MODE else DOCKER_COMPOSE_FILE
    mode_text = "SERVER MODE" if SERVER_MODE else "LOCAL MODE"
    print(f"   - Using {mode_text} configuration: {compose_file.name}")

    if PARANOID_MODE:
        containers = ["backpack_insight_db", "backpack_insight_web", "backpack_insight_backend"]
        print("   - [PARANOID] Cleaning containers...", end="\r")
        for c in containers:
            run_command(f"docker rm -f {c}", silent=True)
        print("   - [PARANOID] Cleaning containers... DONE")
    else:
        print("   - Fast Start Mode (Skipping container cleanup)")

    cache_bust = int(time.time()) if PARANOID_MODE else 1
    os.environ["CACHE_BUST"] = str(cache_bust)

    print("   - Initializing Containers (Build & Up)...")
    cmd_up = f"{compose_cmd()} -f {compose_file} up -d --build"
    res_up = run_command(cmd_up, silent=False if VERBOSE else True)
    if res_up.returncode != 0:
        print("\n[ERROR] Failed to start containers. Set PARANOID_MODE = True to debug.")
        sys.exit(1)
    print("   - Initializing Containers... DONE")

    print("\nServices Started!")
    if SERVER_MODE:
        print("   - API:     http://localhost:8000")
        print("   - DB Port: 5432 (internal only)")
    else:
        print("   - Web:     http://localhost:5080")
        print("   - API:     http://localhost:8000")
        print("   - DB Port: 5432")
    print()


def container_running(name: str) -> bool:
    res = run_command(
        f'docker inspect -f "{{{{.State.Running}}}}" {name}',
        capture_output=True, silent=True,
    )
    return bool(res and res.returncode == 0 and "true" in (res.stdout or "").lower())


def wait_http(url: str, name: str, timeout: int, container=None):
    deadline = time.time() + timeout
    last_error = None
    waited = 0
    while time.time() < deadline:
        if container and waited > 5 and not container_running(container):
            print(" " * 60, end="\r")
            print(f"   - Health check FAILED: {name} — контейнер '{container}' не запущен (упал).")
            return False
        try:
            with urlopen(url, timeout=3) as response:
                status = getattr(response, "status", 200)
                if 200 <= status < 500:
                    print(" " * 60, end="\r")
                    print(f"   - Health check OK: {name} ({url}) -> {status}")
                    return True
        except (URLError, HTTPError, TimeoutError, OSError) as e:
            last_error = e
        waited += 2
        print(f"   - Ожидание {name}... {waited}s/{timeout}s", end="\r")
        time.sleep(2)
    print(" " * 60, end="\r")
    print(f"   - Health check FAILED: {name} ({url})")
    if last_error is not None:
        print(f"     Причина: {describe_conn_error(last_error)}")
    return False


def show_logs():
    print("[3/3] Attaching to logs...")
    print("-------------------------------------------------------")
    print("Press Ctrl+C to stop watching logs (App continues running)")
    print("-------------------------------------------------------")

    compose_file = DOCKER_COMPOSE_SERVER_FILE if SERVER_MODE else DOCKER_COMPOSE_FILE
    targets = "backend db" if SERVER_MODE else "web backend db"
    try:
        subprocess.run(
            f"{compose_cmd()} -f {compose_file} logs -f {targets}",
            cwd=PROJECT_ROOT, shell=True,
        )
    except KeyboardInterrupt:
        print("\n[Logs] Detached. Containers are still running.")


def tail_backend_logs(lines: int = 40):
    """Хвост логов бэкенда — помогает понять, почему health-check не прошёл."""
    compose_file = DOCKER_COMPOSE_SERVER_FILE if SERVER_MODE else DOCKER_COMPOSE_FILE
    print(f"\n--- Последние {lines} строк логов backend ---")
    run_command(f"{compose_cmd()} -f {compose_file} logs --tail {lines} backend")
    print("--- конец логов backend ---")


if __name__ == "__main__":
    check_docker()
    start_services()

    print("[3/3] Running health checks...")
    print(f"   (backend поднимается дольше: миграции + синхронизация ~1100 предметов, лимит {BACKEND_TIMEOUT}s)")
    ok_api = wait_http("http://localhost:8000/", "API", BACKEND_TIMEOUT, container="backpack_insight_backend")
    ok_web = True if SERVER_MODE else wait_http(
        "http://localhost:5080/", "Web", WEB_TIMEOUT, container="backpack_insight_web"
    )

    if FOLLOW_LOGS:
        show_logs()
    else:
        print("-------------------------------------------------------")
        if ok_api and ok_web:
            print("Startup checks passed. Containers continue running in background.")
        else:
            print("Startup checks failed. Проверьте логи контейнеров:")
            print(f"  {compose_cmd()} -f docker-compose.yml logs -f web backend db")
            if not ok_api:
                tail_backend_logs()
        print("-------------------------------------------------------")
        if not (ok_api and ok_web):
            sys.exit(1)
