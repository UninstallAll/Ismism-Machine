@echo off
echo MongoDB 可视化工具启动脚本
echo ========================

REM 检查 Python 是否安装
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 没有找到 Python。请安装 Python 3.x 并确保添加到 PATH 环境变量中。
    goto :eof
)

REM 检查是否存在虚拟环境，如果不存在则创建
if not exist venv (
    echo 创建虚拟环境...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo 错误: 无法创建虚拟环境。
        goto :eof
    )
)

REM 激活虚拟环境并安装依赖
echo 激活虚拟环境并安装依赖...
call venv\Scripts\activate
pip install -r requirements.txt

REM 启动应用程序
echo 启动 MongoDB 可视化工具...
python auto_connect_app.py

REM 退出虚拟环境
call venv\Scripts\deactivate.bat

echo 程序已退出
pause 