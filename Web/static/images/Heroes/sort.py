import os
import shutil


def sort_images():
    # Получаем путь, где запущен скрипт
    base_path = os.getcwd()

    # Список расширений для поиска
    target_extensions = {
        'webp': ['.webp'],
        'avif': ['.avif']
    }

    # Проходим по всем элементам в текущей директории
    for item in os.listdir(base_path):
        item_path = os.path.join(base_path, item)

        # Работаем только с папками (пропускаем файлы и сами созданные папки)
        if os.path.isdir(item_path) and item not in ['webp', 'avif']:
            print(f"Обработка папки: {item}")

            # Создаем целевые папки внутри текущей папки, если их нет
            for folder in target_extensions.keys():
                os.makedirs(os.path.join(item_path, folder), exist_ok=True)

            # Проходим по файлам внутри этой папки
            for file in os.listdir(item_path):
                file_path = os.path.join(item_path, file)

                # Пропускаем, если это папка
                if os.path.isdir(file_path):
                    continue

                # Проверяем расширение файла
                file_ext = os.path.splitext(file)[1].lower()

                for folder, exts in target_extensions.items():
                    if file_ext in exts:
                        dest_path = os.path.join(item_path, folder, file)
                        try:
                            shutil.move(file_path, dest_path)
                            print(f"  [OK] {file} -> {folder}/")
                        except Exception as e:
                            print(f"  [Ошибка] Не удалось переместить {file}: {e}")

    print("\nГотово! Все изображения отсортированы.")


if __name__ == "__main__":
    sort_images()