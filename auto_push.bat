@echo off
chcp 65001 > nul

:: Переходим в папку, где лежит сам этот .bat файл
cd /d "%~dp0"

echo Текущая папка: %cd%

if not exist ".gitattributes" (
    echo [ОШИБКА] .gitattributes не найден!
    echo Проверь, лежит ли этот .bat в той же папке, что и файл.
    dir /b .git*
    pause
    exit /b
)

echo [OK] .gitattributes найден. Начинаю пуш с нормализацией...

:: Сначала сбрасываем индекс и пересчитываем окончания строк
git add --renormalize .

:: Затем добавляем все остальные изменения (удаления, новые файлы)
git add -A

echo Создаю коммит...
git commit -m "Upload Zone CTRL V Fix. Automated push: %date% %time%"

echo Отправляю в удаленный репозиторий...
git push origin HEAD

echo Готово!
