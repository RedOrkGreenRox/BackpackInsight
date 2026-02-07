@echo off
setlocal enabledelayedexpansion

REM ==========================================
REM   Backpack Insight - Docker Launcher
REM ==========================================

REM --- CONFIGURATION: LOGGING ---
REM Set to 'true' to see logs in this console
set SHOW_WEB_LOGS=true
set SHOW_BACKEND_LOGS=true
set SHOW_DB_LOGS=true

cd /d "%~dp0"

echo [1/3] Checking Docker...
docker info >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not running! Please start Docker Desktop.
    pause
    exit /b 1
)

echo [2/3] Starting All Services...
echo.
echo   - Web:     http://localhost:5080
echo   - API:     http://localhost:8000
echo   - DB Port: 5432
echo.

REM Clean up potential conflicts
docker rm -f backpack_insight_db 2>nul
docker rm -f backpack_insight_web 2>nul
docker rm -f backpack_insight_backend 2>nul

REM Start everything in detached mode
docker-compose up --build -d

REM --- 3. Show Logs based on Configuration ---
set LOG_TARGETS=

if /i "%SHOW_WEB_LOGS%"=="true" (
    set LOG_TARGETS=!LOG_TARGETS! web
)
if /i "%SHOW_BACKEND_LOGS%"=="true" (
    set LOG_TARGETS=!LOG_TARGETS! backend
)
if /i "%SHOW_DB_LOGS%"=="true" (
    set LOG_TARGETS=!LOG_TARGETS! db
)

if not "!LOG_TARGETS!"=="" (
    echo.
    echo [3/3] Attaching to logs for:!LOG_TARGETS!
    echo -------------------------------------------------------
    echo Press Ctrl+C to stop watching logs (App continues running)
    echo -------------------------------------------------------
    docker-compose logs -f !LOG_TARGETS!
) else (
    echo.
    echo [3/3] Done. Containers running in background.
    echo (Logging disabled in main.bat configuration)
)

endlocal
