import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_FILE = PROJECT_ROOT / "docs" / "structure.txt"
IGNORE_DIRS = {'.git', '.idea', '__pycache__', '.pytest_cache', 'venv', 'env', 'node_modules'}

def generate_tree(dir_path: Path, prefix: str = ""):
    """Generates a string representation of the directory tree."""
    lines = []
    
    try:
        # Sort: directories first, then files
        items = sorted(os.listdir(dir_path), key=lambda x: (not (dir_path / x).is_dir(), x.lower()))
    except PermissionError:
        return []

    # Filter ignored items
    items = [i for i in items if i not in IGNORE_DIRS]
    
    for i, item in enumerate(items):
        is_last = (i == len(items) - 1)
        connector = "└── " if is_last else "├── "
        
        path = dir_path / item
        lines.append(f"{prefix}{connector}{item}")
        
        if path.is_dir():
            extension = "    " if is_last else "│   "
            lines.extend(generate_tree(path, prefix + extension))
            
    return lines

def main():
    print(f"🌳 Generating structure for: {PROJECT_ROOT}")
    
    tree_lines = [f"{PROJECT_ROOT.name}/"] + generate_tree(PROJECT_ROOT)
    content = "\n".join(tree_lines)
    
    # Ensure docs dir exists
    OUTPUT_FILE.parent.mkdir(exist_ok=True)
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"✅ Structure saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
