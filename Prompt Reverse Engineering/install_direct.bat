@echo off
echo Installing dependencies directly (without virtual environment)...

:: Check Python installation
python --version 2>NUL
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH. Please install Python 3.8 or later.
    pause
    exit /b
)

:: Install base packages
echo Installing base packages (torch, gradio, etc.)...
pip install torch transformers timm Pillow gradio
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install base packages. Please check your internet connection and try again.
    pause
    exit /b
)

:: Install clip-interrogator
echo Installing clip-interrogator...
pip install git+https://github.com/pharmapsychotic/clip-interrogator.git
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install clip-interrogator. Please check your internet connection and try again.
    pause
    exit /b
)

echo All dependencies installed successfully!
echo You can now run the application with "python app.py" or by using the "start_direct.bat" script.
pause 