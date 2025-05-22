@echo off
REM MongoDB Visual Tool Launch Script
REM This script is used to start the MongoDB visualization tool

REM Set command line encoding to UTF-8
chcp 65001 >nul

echo ===================================
echo    Starting MongoDB Visual Tool
echo ===================================
echo.

REM Detect Python environment
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python not found! Make sure Python is installed and added to PATH.
    echo.
    pause
    exit /b
)

REM Determine script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM Create virtual environment (if it doesn't exist)
if not exist venv (
    echo [INFO] Creating virtual environment...
    python -m venv venv
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to create virtual environment!
        pause
        exit /b
    )
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install dependencies (if needed)
echo [INFO] Checking dependencies...
pip install -r requirements.txt

REM Start program
echo [INFO] Starting application...
echo.
python launcher.py

REM Script end
REM Virtual environment will be automatically deactivated when cmd window closes 