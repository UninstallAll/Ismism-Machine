@echo off
echo Starting Simple Prompt Reverse Engineering Tool...

:: Check Python installation
python --version 2>NUL
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH. Please install Python 3.8 or later.
    pause
    exit /b
)

:: Install the latest clip-interrogator
echo Installing the latest clip-interrogator...
pip install --upgrade pip
pip uninstall -y clip-interrogator
pip install git+https://github.com/pharmapsychotic/clip-interrogator.git

:: Check and install basic dependencies
echo Installing required dependencies...
pip install torch Pillow gradio

echo Starting simple application...
python simple_app.py

pause 