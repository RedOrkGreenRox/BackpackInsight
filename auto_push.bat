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

echo [OK] .gitattributes найден. Начинаю пуш...

git add -A
git commit -m "Automated push: %date% %time%"
git push origin HEAD

echo Готово!
pause