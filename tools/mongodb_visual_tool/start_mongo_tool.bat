@echo off
echo =====================================
echo MongoDB Visual Tool Launcher
echo =====================================

REM Check Python environment
echo [1/3] Checking Python installation...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python 3.6 or higher.
    pause
    exit /b
)

REM Create virtual environment if not exists
echo [2/3] Setting up virtual environment...
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ERROR: Failed to activate virtual environment.
    pause
    exit /b
)

REM Install dependencies
echo [3/3] Installing dependencies...
python -m pip install --upgrade pip

echo Installing required packages...
python -m pip install pymongo==4.6.0 PyQt6==6.6.0 Pillow==10.0.0 python-dotenv==1.0.0 rapidfuzz==3.13.0

REM Launch application
echo Launching MongoDB Visual Tool...
python auto_connect_app.py

REM Deactivate virtual environment after exit
call venv\Scripts\deactivate.bat

echo Application closed.
pause 