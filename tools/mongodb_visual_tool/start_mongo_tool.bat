@echo off
REM MongoDB Visual Tool 启动脚本
REM 此脚本用于启动MongoDB可视化工具

REM 设置命令行字符编码为UTF-8
chcp 65001 >nul

echo ===================================
echo    启动 MongoDB Visual Tool
echo ===================================
echo.

REM 探测 Python 环境
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [错误] 未找到Python! 请确保Python已安装并添加到PATH环境变量中。
    echo.
    pause
    exit /b
)

REM 确定脚本所在目录
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM 创建虚拟环境（如果不存在）
if not exist venv (
    echo [信息] 创建虚拟环境...
    python -m venv venv
    if %ERRORLEVEL% neq 0 (
        echo [错误] 创建虚拟环境失败!
        pause
        exit /b
    )
)

REM 激活虚拟环境
call venv\Scripts\activate

REM 安装依赖（如果需要）
echo [信息] 检查依赖...
pip install -r requirements.txt >nul 2>nul

REM 启动程序
echo [信息] 正在启动应用程序...
echo.
python launcher.py

REM 脚本结束
REM 虚拟环境会在cmd窗口关闭时自动停用 