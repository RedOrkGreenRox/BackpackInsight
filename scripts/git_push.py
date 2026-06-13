import subprocess
import sys
from datetime import datetime
from pathlib import Path

# Принудительно UTF-8 для stdout — иначе cp1251 на Windows падает на не-ASCII символах
if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Определяем корень проекта
PROJECT_ROOT = Path(__file__).resolve().parent.parent


def run_git(args, allow_fail=False):
    """Выполняет команду git и возвращает результат."""
    cmd = ["git"] + args
    result = subprocess.run(cmd, cwd=PROJECT_ROOT, text=True, capture_output=True, encoding='utf-8')
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
ChangeLog
Нарезка Items на модули
ItemsBranch.ts 1615 строк → агрегатор 31 строка
12 модулей: ItemsManager, ItemsDataLoader, ItemsFilterManager, ItemsSortManager, ItemsScrollManager, ItemsStateManager, FilterOptionsBuilder, FilterUIRenderer, SearchParser, ItemsRenderer, типы
Производительность / SW / Кэш
_headers: /assets/* max-age=60 → max-age=31536000, immutable
sw.js: /index.html добавлен в STATIC_ASSETS
sw.js: SPA-fallback при офлайне — отдаёт index.html из кэша вместо 503
sw.js: placeholder для картинок при офлайне
PerformanceMonitor: порог RAM < 4 ГБ → <= 2 ГБ, ядер < 4 → <= 2
PerformanceMonitor: добавлена проверка conn.saveData
ItemPreviewPrefetchService: prefetch отключается при saveData/2g
Доступность
nav-tab в сайдбаре: <div> → <a role="menuitem">
#app: <div> → <main aria-live="polite">
Кнопки скинов: добавлен aria-label
invertToggle: добавлен aria-pressed, обновляется при клике
advancedFiltersToggle и dropdown-кнопки: добавлен aria-expanded, обновляется при открытии
nav-btn-top disabled: <div> → <button disabled aria-disabled="true">
Декоративные стрелки ▼: aria-hidden="true"
Иконки лиги: alt="rank" → alt="${hero.league}"
Хардкод строк — устранён
HeroesSectionRenderer: "Герои", "Сортировка по уровню" → t()
ItemsSectionRenderer: "Предметы", "Сортировка по редкости/уровню" → t()
Баг: рассинхронизация сортировки героев
SortController.applySort: return 0 при равных значениях → детерминированный тайbreaker вторичный параметр → имя
HeroesSectionRenderer: начальный порядок приведён к тому же алгоритму
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