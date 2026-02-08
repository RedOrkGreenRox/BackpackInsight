import os
import shutil
from pathlib import Path

# Конфигурация путей
PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_FILE = PROJECT_ROOT / "docs" / "structure.txt"

# Настройки фильтрации
TARGETS_TO_CLEAN = ["__pycache__", ".pytest_cache"]
IGNORE_DIRS = {'.git', '.idea', '__pycache__', '.pytest_cache', 'venv', 'env', 'node_modules', 'dist'}


def clean_cache():
    """Очищает директории кэша перед генерацией структуры."""
    print(f"🧹 Cleaning cache in: {PROJECT_ROOT}")
    count = 0
    for path in PROJECT_ROOT.rglob("*"):
        if path.is_dir() and path.name in TARGETS_TO_CLEAN:
            try:
                shutil.rmtree(path)
                print(f"   Deleted: {path.relative_to(PROJECT_ROOT)}")
                count += 1
            except Exception as e:
                print(f"   Error deleting {path}: {e}")
    print(f"✅ Removed {count} cache directories.\n")


def generate_tree(dir_path: Path, prefix: str = ""):
    """Рекурсивно генерирует строковое представление дерева директорий."""
    lines = []
    try:
        # Сортировка: сначала папки, потом файлы
        items = sorted(os.listdir(dir_path), key=lambda x: (not (dir_path / x).is_dir(), x.lower()))
    except PermissionError:
        return []

    # Фильтруем игнорируемые директории
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
    # 1. Очистка
    clean_cache()

    # 2. Генерация структуры
    print(f"🌳 Generating structure for: {PROJECT_ROOT}")
    tree_lines = [f"{PROJECT_ROOT.name}/"] + generate_tree(PROJECT_ROOT)

    # Создаем папку docs, если она отсутствует
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(tree_lines))

    print(f"✅ Structure saved to: {OUTPUT_FILE.relative_to(PROJECT_ROOT)}")


if __name__ == "__main__":
    main()