@echo off
echo =====================================
echo MongoDB Visual Tool - Optimized Launcher
echo =====================================

:: Set encoding to UTF-8
chcp 65001 >nul

:: Ensure running in the script directory
cd /d %~dp0

echo Starting MongoDB Visual Tool...

:: Check if virtual environment exists
if exist venv (
    echo Using virtual environment...
    call venv\Scripts\activate.bat
    
    :: Use Python from virtual environment
    venv\Scripts\python.exe app.py
    
    :: Exit virtual environment
    call venv\Scripts\deactivate.bat
) else (
    :: Try using system Python
    echo Using system Python...
    python app.py
    
    :: If error, try using py launcher
    if %errorlevel% neq 0 (
        echo Trying py launcher...
        py -3 app.py
        
        :: If still fails
        if %errorlevel% neq 0 (
            echo.
            echo Launch failed! Possible reasons:
            echo 1. Python is not installed or not in PATH
            echo 2. Missing required dependencies
            echo.
            echo Please ensure Python 3.6+ is installed and install required dependencies:
            echo pip install pymongo==4.6.0 Pillow==10.0.0 python-dotenv==1.0.0 rapidfuzz==3.13.0
            echo.
            pause
            exit /b 1
        )
    )
)

echo.
echo MongoDB Visual Tool has been closed.
pause 