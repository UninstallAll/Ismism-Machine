@echo off
REM MongoDB Visual Tool 启动脚本
REM 设置命令行编码为UTF-8
chcp 65001 >nul

echo ================================================
echo        MongoDB Visual Tool 启动程序
echo ================================================
echo.

REM 检测Python环境
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [错误] 未找到Python! 请确保已安装Python并添加到PATH环境变量。
    echo.
    pause
    exit /b
)

REM 确定脚本所在目录并切换到该目录
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM 检查并创建虚拟环境(如果不存在)
if not exist venv (
    echo [信息] 正在创建虚拟环境...
    python -m venv venv
    if %ERRORLEVEL% neq 0 (
        echo [错误] 创建虚拟环境失败!
        pause
        exit /b
    )
    echo [信息] 虚拟环境创建成功。
)

REM 激活虚拟环境
echo [信息] 激活虚拟环境...
call venv\Scripts\activate.bat

REM 检查并安装依赖
echo [信息] 检查并安装依赖...
pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo [警告] 安装依赖时出现问题，程序可能无法正常运行。
) else (
    echo [信息] 依赖检查完成。
)

REM 启动应用程序
echo.
echo [信息] 正在启动MongoDB可视化工具...
echo.
python launcher.py

REM 如果程序异常退出，显示错误代码
if %ERRORLEVEL% neq 0 (
    echo.
    echo [错误] 应用程序异常退出，错误代码: %ERRORLEVEL%
    pause
)

REM 如果已激活虚拟环境，则退出虚拟环境
if defined VIRTUAL_ENV (
    deactivate
)

echo.
echo [信息] MongoDB可视化工具已关闭。
timeout /t 3 >nul 