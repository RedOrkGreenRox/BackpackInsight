import os
import json
import re
from PIL import Image
import pillow_avif  # Поддержка .avif

# === НАСТРОЙКИ ===
JSON_FILE = "items_ru_5_1_0.json"
SOURCE_DIR = "."  # Текущая папка
OUTPUT_DIR = "ОБРАБОТАНО_output" 
CELL_SIZE = 60
VALID_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.webp', '.bmp', '.avif')

# Исключения: предметы, для которых нужно поменять местами ширину и высоту (x и y).
SWAP_DIMENSIONS = [
    "Writhing Tentacle"
]
# =================

def normalize_name(name):
    """
    Приводит строку к нижнему регистру и заменяет все небуквенные
    (и нецифровые) символы на дефис '-'.
    """
    if not name:
        return ""
    name = name.lower()
    return re.sub(r'[^a-zа-яё0-9]', '-', name)

NORMALIZED_SWAP_LIST = [normalize_name(item) for item in SWAP_DIMENSIONS]

def load_shapes(json_path):
    shapes_map = {}
    ignored_set = set() # Список того, что нужно пропускать молча
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            items = data.get('items', [])
            print(len(items))
        
        for item in items:
            item_id = item.get('id', "")
            item_name = item.get('name', "")
            rarity = item.get('rarity', "")
            shape = item.get('itemShape', [])
            
            if not shape or not item_id:
                continue
                
            norm_id = normalize_name(item_id)
            norm_name = normalize_name(item_name)
                
            xs = [cell['x'] for cell in shape]
            ys = [cell['y'] for cell in shape]
            
            width_cells = max(xs) - min(xs) + 1
            height_cells = max(ys) - min(ys) + 1
            
            # Проверяем, есть ли предмет в списке на переворот
            if (norm_id and norm_id in NORMALIZED_SWAP_LIST) or \
               (norm_name and norm_name in NORMALIZED_SWAP_LIST):
                target_w = height_cells * CELL_SIZE
                target_h = width_cells * CELL_SIZE
            else:
                target_w = width_cells * CELL_SIZE
                target_h = height_cells * CELL_SIZE
            
            # Сохраняем в активный словарь
            if norm_id:
                shapes_map[norm_id] = (target_w, target_h)
            if norm_name:
                shapes_map[norm_name] = (target_w, target_h)
            
        return shapes_map, ignored_set
    except Exception as e:
        print(f"Критическая ошибка при чтении JSON: {e}")
        return None, None

def main():
    print("Чтение базы JSON...")
    shapes_map, ignored_set = load_shapes(JSON_FILE)
    if shapes_map is None:
        return

    print("Начинаю обработку картинок...\n")

    success_count = 0
    error_count = 0
    not_found_in_json_count = 0

    for root, dirs, files in os.walk(SOURCE_DIR):
        if OUTPUT_DIR in root or 'venv' in root or root.startswith('./.'):
            continue
            
        for file in files:
            if not file.lower().endswith(VALID_EXTENSIONS):
                continue
                
            source_path = os.path.join(root, file)
            filename_no_ext = os.path.splitext(file)[0]
            
            norm_filename = normalize_name(filename_no_ext)
            
            if "ingredient" in norm_filename or "empty" in norm_filename:
                continue
                
            target_size = shapes_map.get(norm_filename)
            
            if not target_size:
                print(f"[ПРОПУСК] '{file}': не найден в базе JSON.")
                not_found_in_json_count += 1
                error_count += 1
                continue
                
            try:
                rel_path = os.path.relpath(root, SOURCE_DIR)
                target_dir = os.path.join(OUTPUT_DIR, rel_path) if rel_path != "." else OUTPUT_DIR
                os.makedirs(target_dir, exist_ok=True)
                
                target_path = os.path.join(target_dir, file)
                
                with Image.open(source_path) as img:
                    resized_img = img.resize(target_size, Image.Resampling.LANCZOS)
                    resized_img.save(target_path)
                    
                success_count += 1
                
            except Exception as e:
                print(f"[ОШИБКА] '{file}': {e}")
                error_count += 1

    print("\n" + "="*30)
    print("ОТЧЕТ ОБ ОБРАБОТКЕ:")
    print(f"Успешно изменено: {success_count} шт.")
    if error_count > 0:
        print(f"Ошибок / Не найдено в JSON: {error_count} шт.")
    print(f"Результаты лежат в папке: {OUTPUT_DIR}")
    print("="*30)

if __name__ == "__main__":
    main()