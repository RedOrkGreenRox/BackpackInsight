import subprocess
import sys
import os
import time
from pathlib import Path

# --- Configuration ---
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DOCKER_COMPOSE_FILE = PROJECT_ROOT / "docker-compose.yml"

def run_command(command, cwd=PROJECT_ROOT, capture_output=False):
    """Runs a shell command and returns the exit code."""
    try:
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
    print("[1/3] Checking Docker...")
    res = run_command("docker info", capture_output=True)
    if res.returncode != 0:
        print("[ERROR] Docker is not running! Please start Docker Desktop.")
        sys.exit(1)

def start_services(web_only=False):
    print("[2/3] Starting Services...")
    
    # Clean up potential conflicts (optional, but good for stability)
    containers = ["backpack_insight_db", "backpack_insight_web", "backpack_insight_backend"]
    for c in containers:
        run_command(f"docker rm -f {c}", capture_output=True)

    cmd = "docker-compose up --build -d"
    if web_only:
        cmd += " web"
    
    res = run_command(cmd)
    if res.returncode != 0:
        print("[ERROR] Failed to start services.")
        sys.exit(1)
        
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
        run_command(f"docker-compose logs -f {targets}")
    except KeyboardInterrupt:
        print("\n[Logs] Detached. Containers are still running.")

if __name__ == "__main__":
    # Simple argument parsing
    web_only = "--web-only" in sys.argv
    
    check_docker()
    start_services(web_only)
    show_logs(web_only)
