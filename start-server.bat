@echo off
echo.
echo ============================================================
echo   HappyMoments - Starting Local Server
echo ============================================================
echo.

REM Try Python 3 first
python --version >nul 2>&1
if %errorlevel% == 0 (
    python serve.py
    goto :end
)

REM Try py launcher
py --version >nul 2>&1
if %errorlevel% == 0 (
    py serve.py
    goto :end
)

REM Try python3
python3 --version >nul 2>&1
if %errorlevel% == 0 (
    python3 serve.py
    goto :end
)

REM If no Python, use built-in http module approach
echo Python not found. Trying alternative...
echo.
cd web
echo Starting server on http://localhost:8080
echo Open this URL on your Android phone (use your computer's IP)
echo.
echo To find your IP: Open cmd and type 'ipconfig'
echo Look for IPv4 Address under your WiFi adapter
echo.
python -m http.server 8080 2>nul || py -m http.server 8080 2>nul || (
    echo.
    echo ERROR: Python is required to run the local server.
    echo Please install Python from https://www.python.org/downloads/
    echo.
    pause
)

:end
pause
