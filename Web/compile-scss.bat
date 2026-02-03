@echo off
setlocal

REM --- SCSS Compiler ---

echo Changing directory to the script's location...
cd /d "%~dp0"

echo.
echo --- SCSS Compilation Started ---

rem The -q or --quiet flag suppresses all warnings, including deprecation warnings.
sass static/scss/branches/main.scss static/css/main.css -q --no-source-map
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo FAILED to compile main.scss. Check output.
    pause
    exit /b %ERRORLEVEL%
)

sass static/scss/branches/profile.scss static/css/profile.css -q --no-source-map
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo FAILED to compile profile.scss. Check output.
    pause
    exit /b %ERRORLEVEL%
)

sass static/scss/branches/404.scss static/css/404.css -q --no-source-map
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo FAILED to compile 404.scss. Check output.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo All SCSS files compiled successfully.
echo.
echo SCSS compilation window will close in 5 seconds.
endlocal
