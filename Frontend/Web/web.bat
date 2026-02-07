@echo off
setlocal

REM ==========================================
REM   Backpack Insight - Web Launcher (Docker)
REM ==========================================

REM Ensure we are in the script's directory
cd /d "%~dp0"

echo [Web] Starting Web Container via Root Docker Compose...

REM Check if Docker is running
docker info >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not running! Please start Docker Desktop.
    pause
    exit /b 1
)

REM Go to project root
pushd ..\..

REM Start ONLY the web service (and its dependencies: db, backend)
docker-compose up --build -d web

IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to start web container.
    pause
) else (
    echo [Web] Container started. Access at http://localhost:5080
)

popd
endlocal
