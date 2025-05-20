@echo off
echo MongoDB Art Database Viewer (Auto-Connect Version)
echo ===============================================

:: 检查Python是否安装
python --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit
)

:: 获取脚本路径
set SCRIPT_DIR=%~dp0

:: 安装所需包
echo Installing required packages...
pip install pymongo pillow python-dotenv

:: 启动应用，自动连接
echo Starting MongoDB Viewer with Auto-Connect...
python "%SCRIPT_DIR%auto_connect_app.py"

pause 