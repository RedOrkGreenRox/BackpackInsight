import shutil
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TARGETS = ["__pycache__", ".pytest_cache"]

def clean():
    print(f"🧹 Cleaning cache in: {PROJECT_ROOT}")
    count = 0
    
    for path in PROJECT_ROOT.rglob("*"):
        if path.is_dir() and path.name in TARGETS:
            try:
                shutil.rmtree(path)
                print(f"   Deleted: {path.relative_to(PROJECT_ROOT)}")
                count += 1
            except Exception as e:
                print(f"   Error deleting {path}: {e}")
                
    print(f"✅ Removed {count} cache directories.")

if __name__ == "__main__":
    clean()
