@echo off
echo ================================
echo  Ismism数据库可视化工具启动器
echo ================================

REM 切换到工具目录
cd /d %~dp0

REM 检查Python是否安装
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 找不到Python，请确保已安装Python并添加到PATH环境变量中
    pause
    exit /b 1
)

REM 运行Python脚本
echo 正在启动数据库工具...
python ismism_db_tool.py

REM 如果发生错误，等待用户确认
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 程序异常退出
    pause
) 