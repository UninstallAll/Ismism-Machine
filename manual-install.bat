@echo off
chcp 65001 > nul
echo ===================================
echo 主义主义机(Ismism Machine)手动安装
echo ===================================

set /p NODE_PATH=请输入Node.js安装路径(例如C:\Program Files\nodejs): 

if not exist "%NODE_PATH%\node.exe" (
    echo 在指定路径未找到node.exe
    echo 请确保输入正确的Node.js安装路径
    pause
    exit /b 1
)

echo 找到Node.js在: %NODE_PATH%\node.exe
set PATH=%NODE_PATH%;%PATH%

echo Node.js版本:
"%NODE_PATH%\node.exe" -v

echo npm版本:
"%NODE_PATH%\npm.cmd" -v

echo.
echo 安装项目依赖...
"%NODE_PATH%\npm.cmd" install

if %errorlevel% neq 0 (
    echo 依赖安装失败!
    pause
    exit /b 1
)

echo.
echo 依赖安装成功!

echo.
echo 创建必要的目录结构...
if not exist "src" mkdir src
if not exist "public" mkdir public
if not exist "src\components" mkdir src\components
if not exist "src\assets" mkdir src\assets

echo.
echo 环境配置完成!
echo 运行开发服务器: start-dev.bat
echo 构建项目: build.bat
echo.

pause 