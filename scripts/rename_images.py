import os

def rename_logic(name):
    """Приводит к нижнему регистру и меняет пробелы на дефисы."""
    return name.lower().replace(" ", "-")

def run_rename():
    # 1. Поиск папки images
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
        print("Ошибка: Папка 'images' не найдена.")
        return

    print(f"Работаем в директории: {os.path.abspath(target_dir)}")

    # 2. Рекурсивный обход снизу вверх
    for root, dirs, files in os.walk(target_dir, topdown=False):
        for name in files + dirs:
            old_path = os.path.join(root, name)
            new_name = rename_logic(name)
            new_path = os.path.join(root, new_name)

            if old_path != new_path:
                if os.path.exists(new_path):
                    if old_path.lower() == new_path.lower():
                        try:
                            # Трюк с временным файлом
                            temp_path = old_path + ".tmp_rename"
                            os.rename(old_path, temp_path)
                            os.rename(temp_path, new_path)
                            print(f"OK (case change): {name} -> {new_name}")
                        except PermissionError:
                            print(f"ПРОПУЩЕНО (занято системой): {name}")
                        except Exception as e:
                            print(f"Ошибка на {name}: {e}")
                    else:
                        print(f"Пропущено (конфликт): {new_name}")
                else:
                    try:
                        os.rename(old_path, new_path)
                        print(f"OK: {name} -> {new_name}")
                    except PermissionError:
                        print(f"ПРОПУЩЕНО (нет доступа): {name}")
                    except Exception as e:
                        print(f"Ошибка: {e}")

if __name__ == "__main__":
    run_rename()
