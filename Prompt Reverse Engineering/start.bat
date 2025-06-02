@echo off
echo Starting Prompt Reverse Engineering Tool...

:: Check Python installation
python --version 2>NUL
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH.
    echo Please install Python 3.8 or later from https://www.python.org/downloads/
    pause
    exit /b
)

:: Install or update dependencies
echo Installing/updating required dependencies...
pip install --upgrade pip torch Pillow gradio transformers timm

:: Force reinstall clip-interrogator to get the correct version
echo Installing clip-interrogator...
pip uninstall -y clip-interrogator
pip install git+https://github.com/pharmapsychotic/clip-interrogator.git

:: Check which app file exists and run the appropriate one
if exist simple_app.py (
    echo Starting simple version...
    python simple_app.py
) else if exist app.py (
    echo Starting full version...
    python app.py
) else (
    echo ERROR: No application file found.
    pause
    exit /b
)

pause 