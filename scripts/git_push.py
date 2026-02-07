import subprocess
import sys
import os
from datetime import datetime
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

def run_git(args):
    """Runs a git command in the project root."""
    cmd = ["git"] + args
    result = subprocess.run(cmd, cwd=PROJECT_ROOT, text=True)
    if result.returncode != 0:
        print(f"[ERROR] Command failed: {' '.join(cmd)}")
        sys.exit(1)

def main():
    print(f"📂 Working in: {PROJECT_ROOT}")
    
    # Check .gitattributes
    if not (PROJECT_ROOT / ".gitattributes").exists():
        print("[ERROR] .gitattributes not found in root!")
        sys.exit(1)

    print("🔄 Normalizing line endings...")
    run_git(["add", "--renormalize", "."])
    
    print("➕ Adding changes...")
    run_git(["add", "-A"])
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    upd = "Scripts refactored to .py"
    message = f"{upd} | Automated push: {timestamp}"
    
    print(f"💾 Committing: '{message}'")
    # Allow empty commits if nothing changed, just to be safe, or check status first
    subprocess.run(["git", "commit", "-m", message], cwd=PROJECT_ROOT)
    
    print("🚀 Pushing to origin...")
    run_git(["push", "origin", "HEAD"])
    
    print("✅ Done!")

if __name__ == "__main__":
    main()
