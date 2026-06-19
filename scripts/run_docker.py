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
DOCKER_COMPOSE_SERVER_FILE = PROJECT_ROOT / "docker-compose.server.yml"

SERVER_MODE   = False  # True — серверный режим, False — локальный
VERBOSE       = True   # True — подробный вывод
PARANOID_MODE = True   # True — пересобрать с нуля, False — быстрый старт
FOLLOW_LOGS   = False  # True — цепляться к логам после запуска

# Таймауты health-check (сек).
# Backend выполняет alembic upgrade + sync_static_data (~1100 предметов)
# перед открытием порта 8000, поэтому ему нужно значительно больше времени.
BACKEND_TIMEOUT = 180
WEB_TIMEOUT     = 60


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
        res = run_command("docker compose version", capture_output=True, silent=True)
        _COMPOSE_CMD = "docker compose" if (res and res.returncode == 0) else "docker-compose"

    return _COMPOSE_CMD


# ---------------------------------------------------------------------------
# Шаги запуска
# ---------------------------------------------------------------------------

def check_engine() -> None:
    """Проверяет доступность выбранного движка контейнеров."""
    label = "Podman" if IS_PODMAN else "Docker"
    step(1, 3, f"Checking {label} ({ENGINE})")

    res = run_command(f"{ENGINE} info", capture_output=True, silent=True)
    if res is None or res.returncode != 0:
        print(f"\n[ERROR] {label} недоступен или не запущен!")
        if IS_PODMAN:
            print("  Попробуйте: systemctl --user start podman.socket")
        else:
            print("  Пожалуйста, запустите Docker Desktop.")
        sys.exit(1)

    step(1, 3, f"Checking {label} ({ENGINE})", done=True)


def start_services() -> None:
    step(2, 3, "Starting Services")

    compose_file = DOCKER_COMPOSE_SERVER_FILE if SERVER_MODE else DOCKER_COMPOSE_FILE
    label = "Podman" if IS_PODMAN else "Docker"
    mode  = "SERVER MODE" if SERVER_MODE else "LOCAL MODE"
    print(f"   - Engine: {label} ({ENGINE})")
    print(f"   - Mode:   {mode} → {compose_file.name}")

    if PARANOID_MODE:
        containers = [
            "backpack_insight_db",
            "backpack_insight_web",
            "backpack_insight_backend",
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
    cmd_up = f"{compose_cmd()} -f {compose_file} up -d --build"
    res_up = run_command(cmd_up, silent=not VERBOSE)

    # Проверяем None — run_command может вернуть None при исключении
    if res_up is None or res_up.returncode != 0:
        print("\n[ERROR] Не удалось запустить контейнеры.")
        print("  Совет: установите PARANOID_MODE = True для полного пересоздания.")
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
    compose_file = DOCKER_COMPOSE_SERVER_FILE if SERVER_MODE else DOCKER_COMPOSE_FILE
    print(f"\n--- Последние {lines} строк логов [{service}] ---")
    run_command(f"{compose_cmd()} -f {compose_file} logs --tail {lines} {service}")
    print(f"--- конец логов [{service}] ---")


def show_logs() -> None:
    step(3, 3, "Attaching to logs")
    print("-------------------------------------------------------")
    print("Press Ctrl+C to stop watching logs (app continues running)")
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


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    label = "Podman" if IS_PODMAN else "Docker"
    print(f"[init] Container engine: {label} ({ENGINE})")
    if IS_PODMAN and _detect_bazzite():
        print("[init] Bazzite / immutable Fedora detected — using Podman automatically.")
    print()

    check_engine()
    start_services()

    step(3, 3, "Running health checks")
    print(
        f"   (backend поднимается дольше: миграции + синхронизация ~1100 предметов, "
        f"лимит {BACKEND_TIMEOUT}s)"
    )

    ok_api = wait_http(
        "http://localhost:8000/", "API",
        BACKEND_TIMEOUT, container="backpack_insight_backend",
    )
    ok_web = True if SERVER_MODE else wait_http(
        "http://localhost:5080/", "Web",
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
            print(f"  {compose_cmd()} -f docker-compose.yml logs -f web backend db")
            if not ok_api:
                tail_logs("backend")
            if not ok_web and not SERVER_MODE:
                tail_logs("web")
        print("-------------------------------------------------------")

    if not (ok_api and ok_web):
        sys.exit(1)
