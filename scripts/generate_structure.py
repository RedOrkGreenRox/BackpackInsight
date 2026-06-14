import os
from pathlib import Path

# Конфигурация путей
PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_FILE = PROJECT_ROOT / "docs" / "structure.md"
DOCS_ROOT = PROJECT_ROOT / "docs"

# Настройки фильтрации
IGNORE_DIRS = {
    '.git', '.idea', '__pycache__', '.pytest_cache', 'venv', 'env', 'node_modules', 'dist', 
    '.arena', '.cache', 'static', 'images', 'fonts', 'Profiles', 'fixtures', 'migrations',
    'docs', 'tmp'
}
IGNORE_FILES = {
    '.DS_Store', 'structure.md', 'structure.txt', 'package-lock.json', 
    '.dockerignore', '.gitignore', '.gitattributes', 'README.md', 'LICENSE', 'pytest.ini'
}

# Словарь красивых имен
BEAUTIFUL_NAMES = {
    "api.py": "API Бэкенда",
    "database.py": "Конфигурация БД",
    "constants.py": "Константы парсинга",
    "data.py": "Справочник предметов",
    "ProfileFactory.py": "Фабрика профилей",
    "Hero.py": "Модель Героя",
    "Item.py": "Модель Предмета",
    "Profile.py": "Модель Профиля",
    "ItemsBranch.ts": "Список всех предметов",
    "MainBranch.ts": "Главная страница",
    "ProfileBranch.ts": "Страница профиля",
    "ItemDetailBranch.ts": "Детали предмета",
    "core.ts": "Ядро приложения",
    "Shell.ts": "Оболочка (Shell)",
    "Branch.ts": "Базовый Бранч",
    "Gen.ts": "Генератор UI",
    "ApiService.ts": "Сервис API",
    "SearchTermService.ts": "Семантический поиск",
    "icon-parser.ts": "Парсер иконок",
    "JsonValidator.ts": "Валидатор JSON",
    "i18n.ts": "Локализация",
    "_vars.scss": "Переменные дизайна",
    "eventUtils.ts": "Шина событий",
    "LoadingStates.ts": "Состояния загрузки",
    "PaginationController.ts": "Контроллер пагинации",
    "profileCacheUtils.ts": "Кеш профилей",
    "screenshotUtils.ts": "Утилита скриншотов",
    "SortController.ts": "Контроллер сортировки",
    "ImageFormatService.ts": "Сервис форматов изображений",
    "ItemIconService.ts": "Сервис иконок предметов",
    "ItemPreviewPrefetchService.ts": "Предзагрузка предметов",
    "ItemsCacheService.ts": "Кеш предметов",
    "MetaService.ts": "SEO и Мета-данные",
    "SlugService.ts": "Сервис слагов",
    "ItemDataLoader.ts": "Загрузчик данных предмета",
    "ItemDetailManager.ts": "Оркестратор деталей",
    "ItemNavigationManager.ts": "Навигация по предметам",
    "ProfileDataManager.ts": "Менеджер данных профиля",
    "ProfileManager.ts": "Оркестратор профиля",
    "ProfileSkinsManager.ts": "Менеджер скинов",
    "ProfileSortManager.ts": "Логика сортировки",
    "ProfileStateManager.ts": "Менеджер состояния",
    "screenshot-manager.ts": "Менеджер скриншотов",
    "header.ts": "Рендерер заголовка",
    "player-info.ts": "Инфо об игроке",
    "stats-bar.ts": "Панель ресурсов",
    "hero-card.ts": "Карточка героя",
    "heroes-section.ts": "Секция героев",
    "item-card.ts": "Карточка предмета",
    "items-section.ts": "Секция предметов",
    "MainManager.ts": "Оркестратор главной",
    "DraftManager.ts": "Менеджер черновиков",
    "FormManager.ts": "Менеджер форм",
    "ValidationManager.ts": "Менеджер валидации",
    "SubmitManager.ts": "Менеджер отправки",
    "DraftEventHandler.ts": "События черновиков",
    "StorageManager.ts": "Хранилище черновиков",
    "ErrorDisplayManager.ts": "Отображение ошибок",
    "FileHandler.ts": "Обработчик файлов",
    "ClipboardHandler.ts": "Буфер обмена",
    "DragDropHandler.ts": "Drag-and-Drop",
    "UIHandler.ts": "Интерфейс загрузки",
    "navigation.ts": "Навигация Shell",
    "parallax.ts": "Эффект параллакса",
    "sidebar.ts": "Сайдбар меню",
    "ui_init.ts": "Инициализация UI"
}

def find_doc_file(relative_path: Path) -> Path:
    parts = list(relative_path.parts)
    if not parts: return Path()
    if parts[0] == "Frontend" and len(parts) > 1 and parts[1] == "Web":
        parts.pop(1)
    
    doc_dir = DOCS_ROOT
    for p in parts[:-1]:
        doc_dir = doc_dir / p.lower()
    
    if not doc_dir.exists(): return Path()
    
    target_name = parts[-1].rsplit('.', 1)[0].lower() + ".md"
    try:
        for f in os.listdir(doc_dir):
            if f.lower() == target_name:
                doc_path = doc_dir / f
                if doc_path.is_file():
                    return doc_path
    except Exception: pass
    return Path()

def generate_list_tree(dir_path: Path, current_rel_path: Path, indent: int = 1):
    lines = []
    try:
        items = sorted(os.listdir(dir_path), key=lambda x: (not (dir_path / x).is_dir(), x.lower()))
    except PermissionError: return []
    
    items = [i for i in items if i not in IGNORE_DIRS and i not in IGNORE_FILES]

    for item in items:
        full_path = dir_path / item
        rel_path = current_rel_path / item
        doc_file = find_doc_file(rel_path)
        
        pretty_name = BEAUTIFUL_NAMES.get(item, item)
        spaces = "  " * indent
        
        if full_path.is_dir():
            lines.append(f"{spaces}- 📂 **{item}**")
            lines.extend(generate_list_tree(full_path, rel_path, indent + 1))
        else:
            if doc_file and doc_file.exists():
                link_path = os.path.relpath(doc_file, DOCS_ROOT)
                lines.append(f"{spaces}- 📄 [{pretty_name}]({link_path})")
            else:
                lines.append(f"{spaces}- 📄 {pretty_name}")

    return lines

def main():
    tree_nodes = generate_list_tree(PROJECT_ROOT, Path(""))
    final_lines = [
        "# 🗺 Карта структуры BackpackInsight",
        "",
        "Этот файл является центральным узлом [сетевой документации](../README.md).",
        "",
        "| Раздел | Описание |",
        "| :--- | :--- |",
        "| [Бэкенд](backend/api.md) | Python API, Модели, Логика парсинга |",
        "| [Фронтенд](frontend/core.md) | TypeScript, Интерфейс, Дизайн-система |",
        "",
        "## 🏗 Иерархия исходного кода",
        "",
        "> **Подсказка**: Нажмите на название файла, чтобы открыть его документацию.",
        "",
        f"- 📦 **{PROJECT_ROOT.name}**",
        "\n".join(tree_nodes),
        "",
        "---",
        "*Примечание: Технические файлы и ассеты скрыты для чистоты карты.*",
        ""
    ]
    DOCS_ROOT.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(final_lines))
    print(f"Standard list structure saved to: {OUTPUT_FILE.relative_to(PROJECT_ROOT)}")

if __name__ == "__main__":
    main()
