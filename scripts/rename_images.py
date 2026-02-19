import os


def rename_logic(name):
    """Преобразует имя: нижний регистр и замена пробелов на дефис."""
    return name.lower().replace(" ", "-")


def run_rename():
    # 1. Пытаемся найти папку images, перебирая возможные пути
    possible_paths = [
        os.path.join('Frontend', 'Web', 'static', 'images'),
        os.path.join('..', 'Frontend', 'Web', 'static', 'images'),
        'images'
    ]

    target_dir = None
    for p in possible_paths:
        if os.path.exists(p) and os.path.isdir(p):
            target_dir = p
            break

    if not target_dir:
        print("Ошибка: Папка 'images' не найдена. Убедитесь, что запускаете скрипт из BackpackInsight.")
        return

    print(f"Работаем в директории: {os.path.abspath(target_dir)}")

    # 2. Рекурсивный обход снизу вверх
    for root, dirs, files in os.walk(target_dir, topdown=False):
        for name in files + dirs:
            old_path = os.path.join(root, name)
            new_name = rename_logic(name)
            new_path = os.path.join(root, new_name)

            if old_path != new_path:
                # Если файл с новым именем уже существует (например, был 'Icon.png' и 'icon.png')
                if os.path.exists(new_path):
                    print(f"Пропущено (уже существует): {new_name}")
                    continue

                try:
                    os.rename(old_path, new_path)
                    print(f"OK: {name} -> {new_name}")
                except Exception as e:
                    print(f"Ошибка при переименовании {name}: {e}")


if __name__ == "__main__":
    run_rename()