import subprocess
import sys
from datetime import datetime
from pathlib import Path

# Определяем корень проекта
PROJECT_ROOT = Path(__file__).resolve().parent.parent


def run_git(args, allow_fail=False):
    """Выполняет команду git и возвращает результат."""
    cmd = ["git"] + args
    result = subprocess.run(cmd, cwd=PROJECT_ROOT, text=True, capture_output=True)
    if result.returncode != 0 and not allow_fail:
        print(f"[ERROR] Command failed: {' '.join(cmd)}")
        print(f"[STDOUT] {result.stdout}")
        print(f"[STDERR] {result.stderr}")
        sys.exit(1)
    return result


def main():
    print(f"Working in: {PROJECT_ROOT}")

    # 1. Проверяем наличие .gitattributes
    if not (PROJECT_ROOT / ".gitattributes").exists():
        print("[WARNING] .gitattributes not found! Renormalization might be inconsistent.")

    # 2. ФИКС ОШИБКИ: Сначала добавляем все текущие изменения, включая УДАЛЕНИЯ и переименования.
    # Это синхронизирует реальный диск с индексом Git и уберет "фантомные" файлы.
    print("Staging all changes and deletions...")
    run_git(["add", "-A"])

    # 3. Очистка индекса (Применение .gitignore к уже отслеживаемым файлам)
    print("Cleaning index to apply .gitignore rules...")
    run_git(["rm", "-r", "--cached", "."], allow_fail=True)

    # 4. Финальное добавление
    # Заново добавляем все файлы. Поскольку они добавляются с нуля, 
    # Git АВТОМАТИЧЕСКИ применит к ним правила из .gitattributes (CRLF -> LF).
    print("Re-adding files (auto-normalizing line endings)...")
    run_git(["add", "-A"])

    # 5. Проверка изменений
    status = run_git(["status", "--porcelain"])
    if not status.stdout.strip():
        print("Nothing to commit, repository is clean.")
        return

    # 6. Создание сообщения
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    upd = """
Route-level code splitting для SPA-страниц
Async route loaders и race-safe навигация в Gen
Prefetch роутов при hover/focus/idle
Уменьшение initial main bundle
Manual chunks для shared/vendor-кода
Выделение vendor-aos, vendor-fuse, vendor-html2canvas
Единый хешированный CSS bundle
Исправление MIME-типов в Bun server
Безопасный SPA fallback: 404 для отсутствующих assets
Удаление debug-логов с API_SECRET
.gitattributes без BOM
Оптимизация Service Worker cache strategy
Navigation preload в Service Worker
Ограничение размера dynamic cache в Service Worker
Исправление staleWhileRevalidate fetch rejection
PWA manifest icons приведены к корректным размерам
Cache-busting для manifest/apple icons
Исправление PWA meta/apple-touch icon paths
Замена preload языковых файлов на prefetch
Единый ItemsCacheService для справочника предметов
Единый ImageFormatService для выбора AVIF/WebP
Единый SlugService для item slugs
Исправление item image paths с апострофами и спецсимволами
Build-time audit item images
verify:images npm script
Удаление старого экспериментального TS-кода _items
Infinite scroll на странице «Предметы»
Browser-level offscreen optimization для item cards
Debounce поиска предметов
Кеширование Fuse index
Prepared item index для фильтров и поиска
Улучшенное ранжирование поисковых результатов
Взвешенные alias/query expansion для поиска
Терминологический слой для русско-английского поиска
Поддержка русских семантических запросов без API переводчиков
OR-поиск по расширенным query terms
Защита от fuzzy-матча алиасов типа poison -> potion
Взвешивание совпадений по полям: name/type/hero/stats/tooltip/searchText
Строгие search tags в формате [Tag]
OR внутри одной группы тегов [A B]
AND между группами тегов [A] [B C]
Строгие фильтры без семантики
Tie-break сортировки по текущему режиму rarity/name
Исправление сортировки при поиске только по [Tag]
Smart prefetch item detail при hover на карточку
Preload item image при hover
Первые item images грузятся eager/high priority
Централизация image fallback через delegated listener
Удаление inline onerror
Оптимизация ItemDetail image rendering
ItemDetail SEO cleanup и restore
MetaService для client-side meta/json-ld
Удаление мёртвого screenshot utility
html2canvas остаётся только dynamic import
Prefetch html2canvas при hover/focus screenshot button
Памятка по синтаксису search tags
Скрипт анализа символов и слов предметов
analyze:item-text npm script
    """
    message = f"{upd} | Automated push: {timestamp}"

    # 7. Коммит
    print(f"Committing: '{message}'")
    run_git(["commit", "-m", message])

    # 8. Синхронизация с удаленным репозиторием 
    # (allow_fail=True на случай, если ветки еще нет или есть нерешенные конфликты)
    print("Syncing with remote...")
    run_git(["pull", "--rebase", "origin", "main"], allow_fail=True)

    # 9. Пуш
    print("Pushing to origin...")
    run_git(["push", "origin", "HEAD"])

    print("Done! Everything is normalized and pushed.")


if __name__ == "__main__":
    main()