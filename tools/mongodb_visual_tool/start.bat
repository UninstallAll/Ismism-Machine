@echo off
echo MongoDB可视化管理工具启动脚本
echo ===========================

:: 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python未安装或未添加到PATH环境变量中
    echo 请安装Python 3.8或更高版本
    pause
    exit /b
)

:: 检查是否需要安装依赖项
if not exist venv (
    echo 正在创建虚拟环境...
    python -m venv venv
    
    echo 正在安装依赖项...
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)

:: 启动应用程序
echo 启动MongoDB可视化管理工具...
python app.py

pause 