import subprocess
import sys
from datetime import datetime
from pathlib import Path

# Определяем корень проекта (BackpackInsight)
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

    # 1. Проверяем наличие .gitattributes (фундамент доверия)
    if not (PROJECT_ROOT / ".gitattributes").exists():
        print("[WARNING] .gitattributes not found! Renormalization might be inconsistent.")

    # 2. Проверка изменений
    status = run_git(["status", "--porcelain"])
    if not status.stdout.strip():
        print("Nothing to commit, repository is clean.")
        return

    # 3. Ренормализация (Принудительное исправление окончаний строк)
    print("Normalizing line endings (CRLF -> LF)...")
    run_git(["add", "--renormalize", "."])

    # 4. Очистка индекса (Применение .gitignore к уже отслеживаемым файлам)
    # Выкинет .map, логи и прочий мусор, который попал в игнор
    print("Cleaning index from ignored files...")
    run_git(["rm", "-r", "--cached", "."], allow_fail=True)

    # 5. Добавление изменений (учитывая CSS и PlayerData)
    print("Adding changes...")
    run_git(["add", "-A"])

    # 6. Создание сообщения
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    upd = "Kragg, fixes, att3"
    message = f"{upd} | Automated push: {timestamp}"

    # 7. Коммит
    print(f"Committing: '{message}'")
    run_git(["commit", "-m", message])

    # 8. Пуш
    print("Pushing to origin...")
    run_git(["push", "origin", "HEAD"])

    print("Done! Everything is normalized and pushed.")


if __name__ == "__main__":
    main()
