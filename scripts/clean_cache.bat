@echo off
cd /d "%~dp0"
cd ..

:: Удаление всех папок __pycache__ и .pytest_cache
for /d /r . %%d in (__pycache__ .pytest_cache) do @if exist "%%d" rd /s /q "%%d"

echo Весь временный кеш удален!
