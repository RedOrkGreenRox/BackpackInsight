import os
import re
from pathlib import Path

# Конфигурация путей
PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_FILE = PROJECT_ROOT / "docs" / "structure.md"
DOCS_ROOT = PROJECT_ROOT / "docs"

# Настройки фильтрации
IGNORE_DIRS = {
    '.git', '.idea', '__pycache__', '.pytest_cache', 'venv', 'env', 'node_modules', 'dist', 
    '.arena', '.cache', 'tmp', '.github', 'docs'
}
IGNORE_FILES = {
    '.DS_Store', 'structure.md', 'structure.txt', 'package-lock.json',
    '.dockerignore', '.gitignore', '.gitattributes', 'LICENSE', '.env', '.env.example',
    'ARENA.MD'
}

# Словарь красивых имен
BEAUTIFUL_NAMES = {
    # --- Директории (Папки) ---
    "Backend": "Бэкенд (Python/FastAPI)",
    "DB": "База данных и миграции",
    "PlayerData": "Логика игроков и предметов",
    "Frontend": "Фронтенд (TypeScript/Vite)",
    "Web": "Веб-приложение",
    "ground": "Ядро фронтенда",
    "branches": "Страницы приложения",
    "main": "Главная страница",
    "profile": "Страница профиля",
    "items": "Библиотека предметов",
    "itemDetail": "Детализация предмета",
    "404": "Ошибка 404",
    "_404": "Компоненты 404",
    "_main": "Логика главной",
    "_profile": "Логика профиля",
    "_items": "Логика библиотеки",
    "_itemDetail": "Логика деталей",
    "roots": "Корневые системы",
    "_roots": "Базовые стили и Shell",
    "utils": "Утилиты и сервисы",
    "models": "Модели данных",
    "services": "Бизнес-сервисы",
    "migrations": "Миграции БД",
    "versions": "Версии схем",
    "static": "Статические ресурсы",
    "scripts": "Скрипты автоматизации",
    "tests": "Тестирование",
    "header": "Заголовок профиля",
    "heroes": "Секция героев",
    "main-heroes-grid": "Сетка героев",
    "managers": "Менеджеры логики",
    "sort": "Сортировка",
    "draft": "Система черновиков",
    "submit": "Отправка данных",
    "validation": "Валидация JSON",
    "upload-zone": "Зона загрузки",
    "handlers": "Обработчики ввода",
    "button-styles": "Стили кнопок",
    "hint-styles": "Стили подсказок",
    "zone-styles": "Системные стили",
    "navigation": "Навигация",
    "parallax": "Параллакс",
    "sidebar": "Боковое меню",
    "ui_init": "Инициализация UI",
    "builds": "Инструменты сборки данных",
    "functions": "Облачные функции (SSR/SEO)",
    "api": "API роуты",
    "item": "Детализация (SSR)",
    "Profiles": "Эталонные профили",
    "components": "UI Компоненты",
    "hero-info-row": "Инфо-ряд героя",
    "info": "Информация",
    "layout": "Макет",
    "player-stats": "Статистика игрока",
    "section": "Секции",
    "visual": "Визуализация",
    "animations": "Анимации",
    "container": "Контейнер",
    "error": "Ошибка",
    "title": "Заголовок",
    "styles": "Стили",
    "chips": "Чипсы (Теги)",
    "responsive": "Адаптивность",
    "search": "Поиск",
    "actions": "Действия",
    "fixtures": "Тестовые данные",
    "lang": "Языковые пакеты",
    "avif": "Формат AVIF",
    "webp": "Формат WebP",
    "png": "Формат PNG",
    "area": "Фоны игровых зон",
    "const": "Постоянные ассеты",
    "fonticon": "Иконки игровых терминов",
    "placeholder": "Заглушки",
    "fonts": "Шрифты проекта",
    "images": "Галерея изображений",
    "templates": "Шаблоны страниц",
    "button-download": "Кнопка сохранения",
    "buttons-sort": "Кнопки сортировки",
    "manifest": "Ассеты манифеста",
    "background": "Фоновые элементы",
    "body": "Основа страницы",
    "button": "Кнопки",
    "overlay": "Слои наложения",
    "text": "Текстовые блоки",
    "filters": "Система фильтрации",
    "_json-validation": "Валидация JSON",
    "section-title": "Заголовки секций",
    "localization": "Локализация",
    "_loading-states": "Индикаторы загрузки",
    
    # Герои (Папки ассетов)
    "buzz": "Герой: Buzz",
    "celeste": "Герой: Celeste",
    "chana": "Герой: Chana",
    "dorf": "Герой: Dorf",
    "enoch": "Герой: Enoch",
    "fern": "Герой: Fern",
    "harkon": "Герой: Harkon",
    "hob": "Герой: Hob",
    "kragg": "Герой: Kragg",
    "morrow": "Герой: Morrow",
    "nymphedora": "Герой: Nymphedora",
    "pepper": "Герой: Pepper",
    "ronan": "Герой: Ronan",
    "sage": "Герой: Sage",
    "tink": "Герой: Tink",
    "zahir": "Герой: Zahir",

    # --- Файлы (Логика и Данные) ---
    "api.py": "API Бэкенда",
    "database.py": "Конфигурация БД",
    "bootstrap.py": "Бутстрап БД",
    "init_db.sql": "SQL Инициализация",
    "reset_db.py": "Сброс базы данных",
    "env.py": "Среда миграций",
    "script.py.mako": "Шаблон ревизий",
    "constants.py": "Константы парсинга",
    "data.py": "Справочник предметов",
    "ProfileFactory.py": "Фабрика профилей",
    "Hero.py": "Модель Героя",
    "Item.py": "Модель Предмета",
    "Profile.py": "Модель Профиля",
    "ItemsBranch.ts": "Класс библиотеки предметов",
    "MainBranch.ts": "Класс главной страницы",
    "ProfileBranch.ts": "Класс страницы профиля",
    "ItemDetailBranch.ts": "Класс деталей предмета",
    "NotFoundBranch.ts": "Класс страницы 404",
    "icon_parser.py": "Парсер иконок (Python)",
    "icon-parser.ts": "Парсер иконок (TS)",
    "core.ts": "Ядро приложения",
    "Shell.ts": "Оболочка (Shell)",
    "Branch.ts": "Базовый класс страницы",
    "Gen.ts": "Генератор интерфейса",
    "ApiService.ts": "Сервис API",
    "SearchTermService.ts": "Семантический поиск",
    "JsonValidator.ts": "Валидатор JSON",
    "i18n.ts": "Локализация",
    "LoadingStates.ts": "Состояния загрузки",
    "profileCacheUtils.ts": "Кэширование профиля",
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
    "ItemSEOManager.ts": "Менеджер SEO предмета",
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
    "Parallax.ts": "Эффект параллакса (Класс)",
    "sidebar.ts": "Сайдбар меню",
    "ui_init.ts": "Инициализация UI",
    "__init__.py": "Маркер пакета",
    "index.ts": "Точка входа модуля",
    "README.md": "Описание проекта",
    "server.ts": "Runtime-сервер",
    "vite.config.ts": "Конфигурация Vite",
    "tsconfig.json": "Конфигурация TypeScript",
    "package.json": "Зависимости и скрипты",
    "Dockerfile": "Инструкции Docker",
    "check_docs.py": "Линтер документации",
    "generate_structure.py": "Генератор карты",
    "run_docker.py": "Запуск Docker",
    "run_tests.py": "Запуск тестов",
    "git_push.py": "Пуш в репозиторий",
    "rename_images.py": "Переименование ассетов",
    "verify_indexes.py": "Проверка индексов",
    "conftest.py": "Инфраструктура тестов",
    "sw.js": "Service Worker",
    "manifest.json": "Манифест PWA",
    "robots.txt": "Инструкции роботам",
    "browserconfig.xml": "Конфиг браузера",
    "global.d.ts": "Глобальные типы",
    "ItemDetailRenderer.ts": "Рендерер деталей",
    "upload-zone.ts": "Логика зоны загрузки",
    "upload.ts": "Менеджер загрузки",
    "error.ts": "Рендерер ошибок",
    "container.ts": "Рендерер контейнера",
    "title.ts": "Рендерер заголовка",
    "background.ts": "Менеджер фона",
    "button.ts": "Рендерер кнопки",
    "text.ts": "Рендерер текста",
    "rarity-weights.ts": "Веса редкостей",
    "profile-types.ts": "Типы профиля",
    "item-detail-types.ts": "Типы деталей",
    "analyze-item-text.js": "Скрипт анализа текстов",
    "optimize-images.js": "Скрипт оптимизации картинок",
    "verify-item-images.js": "Скрипт проверки иконок",
    "sitemap.ts": "Генератор Sitemap",
    "seo-utils.ts": "Утилиты SEO",
    "en.json": "Локализация (EN)",
    "ru.json": "Локализация (RU)",
    "term-aliases.ru.json": "Синонимы поиска (RU)",
    "DI4-new.json": "Пример: DI4 (Обновленный)",
    "DI4.json": "Пример: DI4 (Базовый)",
    "German.json": "Пример: German",
    "hush.json": "Пример: Hush",
    "Lotreomon.json": "Пример: Lotreomon",
    "Marat.json": "Пример: Marat",
    "merul.json": "Пример: Merul",
    "Molodoy_Zhuk.json": "Пример: Molodoy Zhuk",
    "rimaster.json": "Пример: Rimaster",
    "Sky.json": "Пример: Sky",
    "Sky_of_BFG.json": "Пример: Sky (BFG)",
    "Teger.json": "Пример: Teger",
    "xr1stos422.json": "Пример: xr1stos422",
    "German_build_1.json": "Билд: German #1",
    "German_log_1.json": "Лог боя: German #1",
    "Sky_Dorf_1.json": "Лог боя: Sky (Dorf)",
    "itemdefinition_202602081521.csv": "Сырые данные предметов (CSV)",
    "README_icon_parser.md": "Документация парсера иконок",
    "synthetic_profile_full.json": "Сэмпл: Полный профиль",
    "synthetic_profile_minimal.json": "Сэмпл: Минимальный профиль",
    "requirements.txt": "Список зависимостей",
    "alembic.ini": "Конфиг Alembic",
    "docker-compose.yml": "Docker Compose (Dev)",
    "docker-compose.server.yml": "Docker Compose (Prod)",
    "vitest.config.ts": "Конфиг Vitest",
    "update.ps1": "Скрипт очистки Windows",
    "_headers": "Заголовки Cloudflare",
    "0001_initial_schema.py": "Ревизия: Начальная схема",
    "0002_profile_indexes_and_timestamps.py": "Ревизия: Индексы и Время",
    "test_api.py": "Тесты API",
    "test_backend.py": "Тесты Бэкенда",
    "test_data_loader.py": "Тесты Загрузчика",
    "test_db_integration.py": "Тесты Интеграции БД",
    "test_models.py": "Тесты Моделей",
    "test_profile_factory.py": "Тесты Фабрики",
    "test_profiles_integration.py": "Тесты Интеграции Профилей",
    "test_utils.py": "Тесты Утилит",
    "utils.py": "Утилиты бэкенда",
    "items_tooltips.json": "Тултипы предметов",
    "[[path]].ts": "Прокси-функция API",
    "item_detail.test.ts": "Тест: Детализация",
    "items_logic.test.ts": "Тест: Логика Вики",
    "json_validator.test.ts": "Тест: Валидация JSON",
    "profile_logic.test.ts": "Тест: Логика Профиля",
    "sort_controller.test.ts": "Тест: Сортировка",
    "utils.test.ts": "Тест: Утилиты",
    "pytest.ini": "Настройки Pytest",
    "index.html": "Главный HTML шаблон",

    # --- Файлы (Стили .scss) ---
    "_vars.scss": "Дизайн-переменные",
    "_reset.scss": "Базовый сброс",
    "_shell.scss": "Стили оболочки",
    "_fonts.scss": "Шрифты",
    "_animations.scss": "Глобальные анимации",
    "_interactivity.scss": "Интерактивность",
    "_error.scss": "Стили ошибок",
    "_low-res.scss": "Режим экономии",
    "_item-card.scss": "Стили карточки",
    "_item-image.scss": "Стили иконки",
    "_item-name.scss": "Стили названия",
    "_item-rarities.scss": "Стили редкостей",
    "_item-level.scss": "Стили уровня",
    "_item-link.scss": "Стили ссылки",
    "_items-grid.scss": "Стили сетки",
    "_items.scss": "Стили предметов (Wiki)",
    "_rarity-vars.scss": "Переменные редкости",
    "_button-toggle.scss": "Кнопка меню",
    "_controls-wrapper.scss": "Обертка управления",
    "_background.scss": "Стили фона",
    "_button-logo.scss": "Логотип в меню",
    "_lang-switcher.scss": "Переключатель языка",
    "_nav-tab.scss": "Вкладки навигации",
    "_page-title.scss": "Заголовки меню",
    "_sidebar.scss": "Боковое меню",
    "main.scss": "Стили главной",
    "profile.scss": "Стили профиля",
    "items.scss": "Стили Вики",
    "itemDetail.scss": "Стили деталей",
    "404.scss": "Стили 404",
    "animations.scss": "Анимации страницы",
    "error.scss": "Стили уведомлений",
    "container.scss": "Стили контейнера",
    "title.scss": "Стили заголовка",
    "upload-zone.scss": "Стили зоны загрузки",
    "upload-area.scss": "Стили области загрузки",
    "upload-hint.scss": "Стили подсказки",
    "button-view-profile.scss": "Стиль кнопки профиля",
    "button-base.scss": "База кнопки",
    "button-responsive.scss": "Адаптив кнопки",
    "button-states.scss": "Состояния кнопки",
    "upload-hint-base.scss": "База подсказки",
    "upload-hint-pc-only.scss": "ПК-подсказка",
    "upload-area-base.scss": "База области",
    "upload-area-hover.scss": "Ховер области",
    "upload-area-responsive.scss": "Адаптив области",
    "upload-area-textarea.scss": "Стили текстового поля",
    "upload-area-user-select.scss": "Управление выделением",
    "visually-hidden.scss": "Скрытые элементы",
    "json-validation.scss": "Стили редактора ошибок",
    "loading-states.scss": "Стили загрузки",
    "container-base.scss": "База контейнера",
    "container-responsive.scss": "Адаптив контейнера",
    "title-base.scss": "База заголовка",
    "title-responsive.scss": "Адаптив заголовка",
    "_actual-version.scss": "Версия игры",
    "_header.scss": "Контейнер шапки",
    "_nickname.scss": "Стиль никнейма",
    "_stat-hero-card.scss": "Мини-герой",
    "_stat-items-grid.scss": "Сводка предметов",
    "_stat-player-card.scss": "Карточка ресурса",
    "_stats-heroes-grid.scss": "Мини-сетка героев",
    "_stats-heroes-wrapper.scss": "Обертка героев",
    "_stats-player-grid.scss": "Сетка ресурсов",
    "_card.scss": "Большая карточка",
    "_grid.scss": "Сетка героев",
    "_header-row.scss": "Верхний ряд",
    "_image.scss": "Портрет героя",
    "_info.scss": "Инфо-блок",
    "_level-rating.scss": "Уровень и ранг",
    "_main-heroes-grid.scss": "Агрегатор героев",
    "_name.scss": "Имя персонажа",
    "_button-download.scss": "Кнопка сохранения",
    "_buttons-sort.scss": "Кнопки сортировки",
    "_section-title.scss": "Заголовок секции",
    "_layout.scss": "Макет страницы",
    "_mobile.scss": "Моб. адаптив",
    "_tablet.scss": "Планш. адаптив",
    "_filters.scss": "Агрегатор фильтров",
    "_advanced-panel.scss": "Расширенная панель",
    "_dropdown.scss": "Контейнер списка",
    "_dropdown-content.scss": "Контент списка",
    "_dropdown-toggle.scss": "Кнопка списка",
    "_filter-controls.scss": "Обертка фильтров",
    "_filter-group.scss": "Группа фильтров",
    "_filter-toggle.scss": "Кнопка фильтров",
    "_checkbox.scss": "Стили чекбоксов",
    "_clear-btn.scss": "Кнопка очистки",
    "_filter-actions.scss": "Действия фильтров",
    "_fade-up.scss": "Анимация вылета",
    "_loading-spinner.scss": "Спиннер загрузки",
    "_filter-chip.scss": "Фильтр-чипсы",
    "_rarity-colors.scss": "Цвета чипсов",
    "_section.scss": "Стили секций",
    "_visual.scss": "Стили визуализации",
    "_hero-info-row.scss": "Стили инфо-ряда",
    "_navigation.scss": "Стили навигации",
    "_player-stats.scss": "Стили статов игрока",
    "_info.scss": "Стили инфо-блока",
    "overlay.scss": "Стили оверлея",
    "body.scss": "Стили основы",
    "background.scss": "Стили фона",
    "button.scss": "Стили кнопки",
    "text.scss": "Стили текста",
    "index.scss": "Индекс стилей",
    "_roots.scss": "Агрегатор ядра",
    "_container.scss": "Стили контейнера",
    "_input.scss": "Стили поля ввода",
    "_item-image.scss": "Стили иконки",
    "_items-grid.scss": "Стили сетки",
    "ClipboardHandler.ts": "Обработчик буфера",
    "DragDropHandler.ts": "Обработчик Drag-n-Drop",
    "FileHandler.ts": "Обработчик файлов",
    "UIHandler.ts": "Обработчик интерфейса",
    "ErrorDisplayManager.ts": "Менеджер ошибок",
    "DraftEventHandler.ts": "События черновиков",
    "StorageManager.ts": "Менеджер хранилища"
}

def find_doc_file(relative_path: Path) -> Path:
    parts = list(relative_path.parts)
    if not parts: return None
    if parts[0] == "Frontend" and len(parts) > 1 and parts[1] == "Web":
        parts.pop(1)
    
    doc_dir = DOCS_ROOT
    for p in parts[:-1]:
        candidate = doc_dir / p
        if candidate.is_dir():
            doc_dir = candidate
            continue
        lower = doc_dir / p.lower()
        if lower.is_dir():
            doc_dir = lower
            continue
        match = None
        if doc_dir.is_dir():
            try:
                for entry in os.listdir(doc_dir):
                    if entry.lower() == p.lower() and (doc_dir / entry).is_dir():
                        match = doc_dir / entry
                        break
            except Exception: pass
        if match is None:
            return None
        doc_dir = match
    
    if not doc_dir.exists(): return None
    
    filename = parts[-1]
    possible_names = []
    
    base = filename
    ext = ""
    if '.' in filename:
        base = filename.rsplit('.', 1)[0]
        ext = filename.rsplit('.', 1)[1]
        if filename.endswith('.d.ts'):
            base = filename[:-len('.d.ts')]
            ext = 'd.ts'

    if ext in ['ts', 'py', 'js']:
        possible_names.append(f"{base.lower()}_{ext.replace('.', '_')}.md")
    
    possible_names.append(f"{base.lower()}.md")
    possible_names.append(f"{filename.lower()}.md")
    
    try:
        existing_files = os.listdir(doc_dir)
        for target in possible_names:
            for f in existing_files:
                if f.lower() == target:
                    doc_path = doc_dir / f
                    if doc_path.is_file(): return doc_path
    except Exception: pass
    return None

def generate_list_tree(dir_path: Path, current_rel_path: Path, indent: int = 1):
    lines = []
    try:
        # Сортируем: сначала папки, потом файлы
        items = sorted(os.listdir(dir_path), key=lambda x: (not (dir_path / x).is_dir(), x.lower()))
    except PermissionError: return []
    
    items = [i for i in items if i not in IGNORE_DIRS and i not in IGNORE_FILES]

    for item in items:
        full_path = dir_path / item
        rel_path = current_rel_path / item
        
        # Специальное правило для [id].ts и [[path]].ts
        # и версионных json
        if item == "[id].ts":
            pretty_name = "Детализация (SSR)"
        elif item == "[[path]].ts":
            pretty_name = "Прокси-функция API"
        elif re.match(r'items_\d+_\d+_\d+\.json', item):
            version = item.replace('items_', '').replace('.json', '').replace('_', '.')
            pretty_name = f"Справочник предметов (v{version})"
        else:
            pretty_name = BEAUTIFUL_NAMES.get(item, item)
            
        spaces = "  " * indent
        
        if full_path.is_dir():
            folder_doc = find_doc_file(rel_path / "index.ts")
            if folder_doc and folder_doc.exists():
                link_path = os.path.relpath(folder_doc, DOCS_ROOT).replace("\\", "/")
                lines.append(f"{spaces}- 📂 [**{pretty_name}**]({link_path})")
            else:
                lines.append(f"{spaces}- 📂 **{pretty_name}**")
            lines.extend(generate_list_tree(full_path, rel_path, indent + 1))
        else:
            doc_file = find_doc_file(rel_path)
            is_asset = item.lower().endswith(('.avif', '.webp', '.png', '.jpg', '.jpeg', '.svg', '.woff2', '.woff', '.ttf', '.ico', '.db', '.ps1'))
            if doc_file and doc_file.exists():
                link_path = os.path.relpath(doc_file, DOCS_ROOT).replace("\\", "/")
                lines.append(f"{spaces}- 📄 [{pretty_name}]({link_path})")
            elif not is_asset:
                lines.append(f"{spaces}- ❌ {pretty_name} <!-- MISSING DOC -->")

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
        "| [Бэкенд](backend/index.md) | Python API, Модели, Логика парсинга |",
        "| [Фронтенд](frontend/index.md) | TypeScript, Интерфейс, Дизайн-система |",
        "",
        "## 🏗 Иерархия исходного кода",
        "",
        "> **Подсказка**: Нажмите на название файла, чтобы открыть его документацию.",
        "",
        f"- 📦 **BackpackInsight**",
        "\n".join(tree_nodes),
        "",
        "---",
        "*Примечание: Технические файлы и ассеты скрыты для чистоты карты.*",
        "",
        "---",
        "",
        "> 📌 **Подпись документации:** карта генерируется автоматически скриптом `scripts/generate_structure.py`. Не редактируйте вручную — запустите скрипт после изменений в дереве исходников.",
        ""
    ]
    DOCS_ROOT.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(final_lines))
    print(f"Standard list structure saved to: {OUTPUT_FILE.relative_to(PROJECT_ROOT)}")

if __name__ == "__main__":
    main()
