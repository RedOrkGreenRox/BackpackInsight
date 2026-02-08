import subprocess
import sys
import os
import time
from pathlib import Path

# --- Configuration ---
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DOCKER_COMPOSE_FILE = PROJECT_ROOT / "docker-compose.yml"

# --- UI & Performance Settings ---
VERBOSE = True  # True — выводит всё (pip, npm, шаги Vite)
PARANOID_MODE = False  # False — быстрый запуск (кэш). True — чистит всё и пересобирает с нуля.


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
    cmd_up = "docker-compose up -d --build"
    if web_only:
        cmd_up += " web"

    # Запускаем. Docker Compose сам подтянет CACHE_BUST из os.environ
    res_up = run_command(cmd_up, silent=False if VERBOSE else True)
    if res_up.returncode != 0:
        print("\n[ERROR] Failed to start containers. Set PARANOID_MODE = True to debug.")
        sys.exit(1)
    print(f"   - Initializing Containers... DONE")

    print("\n✅ Services Started!")
    print("   - Web:     http://localhost:5080")
    if not web_only:
        print("   - API:     http://localhost:8000")
        print("   - DB Port: 5432")
    print()


def show_logs(web_only=False):
    print("[3/3] Attaching to logs...")
    print("-------------------------------------------------------")
    print("Press Ctrl+C to stop watching logs (App continues running)")
    print("-------------------------------------------------------")

    targets = "web" if web_only else "web backend db"
    try:
        subprocess.run(f"docker-compose logs -f {targets}", cwd=PROJECT_ROOT, shell=True)
    except KeyboardInterrupt:
        print("\n[Logs] Detached. Containers are still running.")


if __name__ == "__main__":
    web_only = "--web-only" in sys.argv
    if "--verbose" in sys.argv:
        VERBOSE = True
    # Также добавил возможность включить паранойю через консоль
    if "--paranoid" in sys.argv:
        PARANOID_MODE = True

    check_docker()
    start_services(web_only)
    show_logs(web_only)