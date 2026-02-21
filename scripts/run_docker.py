import subprocess
import sys
import os
import time
from pathlib import Path

# --- Configuration ---
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DOCKER_COMPOSE_FILE = PROJECT_ROOT / "docker-compose.yml"
DOCKER_COMPOSE_SERVER_FILE = PROJECT_ROOT / "docker-compose.server.yml"

# --- UI & Performance Settings ---
VERBOSE = True  # True — выводит всё (pip, npm, шаги Vite)
PARANOID_MODE = True  # False — быстрый запуск (кэш). True — чистит всё и пересобирает с нуля.
SERVER_MODE = False  # True — серверный режим, False — локальный режим

# --- Code Flags (приоритет над аргументами командной строки) ---
# Измените эти значения для переключения режимов без использования аргументов
# Установите в None для использования аргументов командной строки

FORCE_SERVER_MODE = None  # True=серверный режим, False=локальный, None=из аргументов
FORCE_VERBOSE = None      # True=подробный вывод, False=тихий, None=из аргументов  
FORCE_PARANOID = None     # True=пересобрать с нуля, False=быстрый, None=из аргументов
FORCE_WEB_ONLY = None     # True=только веб/бэкенд, False=все сервисы, None=из аргументов

# Примеры использования:
# FORCE_SERVER_MODE = True   # Всегда запускать в серверном режиме
# FORCE_PARANOID = False    # Всегда быстрый запуск без пересборки
# FORCE_VERBOSE = True       # Всегда подробный вывод


def run_command(command, cwd=PROJECT_ROOT, capture_output=False, silent=False):
    """Runs a shell command and manages output visibility."""
    try:
        if silent and not VERBOSE:
            result = subprocess.run(
                command,
                cwd=cwd,
                shell=True,
                check=False,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                text=True
            )
            if result.returncode != 0 and result.stderr:
                print(f"\n[CRITICAL ERROR in {command}]:\n{result.stderr}")
            return result

        result = subprocess.run(
            command,
            cwd=cwd,
            shell=True,
            check=False,
            capture_output=capture_output,
            text=True
        )
        return result
    except Exception as e:
        print(f"Error running command '{command}': {e}")
        return None


def check_docker():
    print("[1/3] Checking Docker...", end="\r")
    res = run_command("docker info", capture_output=True, silent=True)
    if res.returncode != 0:
        print("\n[ERROR] Docker is not running! Please start Docker Desktop.")
        sys.exit(1)
    print("[1/3] Checking Docker... OK")


def start_services(web_only=False):
    print("[2/3] Starting Services...")

    # Выбор файла конфигурации
    compose_file = DOCKER_COMPOSE_SERVER_FILE if SERVER_MODE else DOCKER_COMPOSE_FILE
    mode_text = "SERVER MODE" if SERVER_MODE else "LOCAL MODE"
    print(f"   - Using {mode_text} configuration: {compose_file.name}")

    # 1. Чистка старых контейнеров (Только в режиме паранойи)
    if PARANOID_MODE:
        containers = ["backpack_insight_db", "backpack_insight_web", "backpack_insight_backend"]
        print(f"   - [PARANOID] Cleaning containers...", end="\r")
        for c in containers:
            run_command(f"docker rm -f {c}", silent=True)
        print(f"   - [PARANOID] Cleaning containers... DONE")
    else:
        print(f"   - Fast Start Mode (Skipping container cleanup)")

    # 2. Сборка и Запуск
    cache_bust = int(time.time()) if PARANOID_MODE else 1

    # Устанавливаем переменную окружения средствами Python (универсально для Win/Linux)
    os.environ["CACHE_BUST"] = str(cache_bust)

    print(f"   - Initializing Containers (Build & Up)...")

    # Теперь команда чистая, без лишних флагов, которые ломали запуск
    cmd_up = f"docker-compose -f {compose_file} up -d --build"
    if web_only:
        cmd_up += " web"

    # Запускаем. Docker Compose сам подтянет CACHE_BUST из os.environ
    res_up = run_command(cmd_up, silent=False if VERBOSE else True)
    if res_up.returncode != 0:
        print("\n[ERROR] Failed to start containers. Set PARANOID_MODE = True to debug.")
        sys.exit(1)
    print(f"   - Initializing Containers... DONE")

    print("\nServices Started!")
    
    # Разные порты для разных режимов
    if SERVER_MODE:
        print("   - API:     http://localhost:8000")
        print("   - DB Port: 5432 (internal only)")
    else:
        print("   - Web:     http://localhost:5080")
        print("   - API:     http://localhost:8000")
        print("   - DB Port: 5432")
    print()


def show_logs(web_only=False):
    print("[3/3] Attaching to logs...")
    print("-------------------------------------------------------")
    print("Press Ctrl+C to stop watching logs (App continues running)")
    print("-------------------------------------------------------")

    # Выбор файла конфигурации
    compose_file = DOCKER_COMPOSE_SERVER_FILE if SERVER_MODE else DOCKER_COMPOSE_FILE
    
    # Разные сервисы для разных режимов
    if SERVER_MODE:
        targets = "backend db" if not web_only else "backend"
    else:
        targets = "web backend db" if not web_only else "web"
    
    try:
        subprocess.run(f"docker-compose -f {compose_file} logs -f {targets}", cwd=PROJECT_ROOT, shell=True)
    except KeyboardInterrupt:
        print("\n[Logs] Detached. Containers are still running.")


if __name__ == "__main__":
    # Аргументы командной строки
    web_only = "--web-only" in sys.argv
    arg_verbose = "--verbose" in sys.argv
    arg_paranoid = "--paranoid" in sys.argv
    arg_server = "--server" in sys.argv
    
    # Применяем флаги из кода с приоритетом над аргументами
    if FORCE_WEB_ONLY is not None:
        web_only = FORCE_WEB_ONLY
    if FORCE_VERBOSE is not None:
        VERBOSE = FORCE_VERBOSE
    else:
        VERBOSE = arg_verbose
    if FORCE_PARANOID is not None:
        PARANOID_MODE = FORCE_PARANOID
    else:
        PARANOID_MODE = arg_paranoid
    if FORCE_SERVER_MODE is not None:
        SERVER_MODE = FORCE_SERVER_MODE
    else:
        SERVER_MODE = arg_server

    check_docker()
    start_services(web_only)
    show_logs(web_only)
