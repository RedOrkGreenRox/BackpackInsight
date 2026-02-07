@echo off
:: Устанавливаем кодировку UTF-8
chcp 65001 > nul

:: Переходим в папку, где лежит сам этот .bat файл
cd /d "%~dp0"

:: Поднимаемся на один уровень выше (в корень проекта)
cd ..

echo Текущая рабочая папка: %cd%

:: Проверяем наличие .gitattributes в корне
if not exist ".gitattributes" (
    echo [ОШИБКА] .gitattributes не найден в папке %cd%!
    echo Убедись, что папка scripts находится внутри корня проекта.
    dir /b .git*
    pause
    exit /b
)

echo [OK] .gitattributes найден. Начинаю пуш с нормализацией...

:: Сбрасываем индекс и пересчитываем окончания строк (LF/CRLF)
git add --renormalize .

:: Добавляем все остальные изменения
git add -A

echo Создаю коммит...
:: Используем переменную окружения для даты и времени
git commit -m "Backend refactored, DB 3/4. Automated push: %DATE% %TIME%"

echo Отправляю в удаленный репозиторий...
git push origin HEAD

echo Готово!