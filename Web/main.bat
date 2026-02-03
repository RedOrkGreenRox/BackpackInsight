@echo off
setlocal

REM --- SCSS Compiler and Application Starter ---

echo Changing directory to the script's location...
cd /d "%~dp0"

REM --- Step 1: Compile SCSS files quietly ---
echo.
echo --- Compiling SCSS ---

rem Using 'call' ensures that control returns to this script after sass is done.
call sass static/scss/branches/main.scss static/css/main.css -q --no-source-map
IF %ERRORLEVEL% NEQ 0 (
    echo FAILED to compile main.scss. Halting script.
    pause
    exit /b %ERRORLEVEL%
)

call sass static/scss/branches/profile.scss static/css/profile.css -q --no-source-map
IF %ERRORLEVEL% NEQ 0 (
    echo FAILED to compile profile.scss. Halting script.
    pause
    exit /b %ERRORLEVEL%
)

call sass static/scss/branches/404.scss static/css/404.css -q --no-source-map
IF %ERRORLEVEL% NEQ 0 (
    echo FAILED to compile 404.scss. Halting script.
    pause
    exit /b %ERRORLEVEL%
)

echo All SCSS files compiled successfully.
echo.

REM --- Step 2: Find and Run Python Server ---
echo --- Starting Python Server ---
echo Searching for Python interpreter...

set "PROJECT_ROOT=..\..\"
if exist "%PROJECT_ROOT%venv\Scripts\python.exe" (
    echo Found Python in the virtual environment.
    set "PYTHON_EXE=%PROJECT_ROOT%venv\Scripts\python.exe"
) else (
    echo Virtual environment not found. Falling back to default 'python'.
    set "PYTHON_EXE=python"
)

echo.
echo Starting the Python server...
rem Run python directly. PyCharm's 'stop' button will terminate it.
%PYTHON_EXE% main.py

endlocal
