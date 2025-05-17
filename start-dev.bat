@echo off
chcp 65001 > nul
echo ===================================
echo 主义主义机(Ismism Machine)开发服务器
echo ===================================

:: 尝试查找常见的Node.js安装路径
set NODE_PATHS=C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;C:\nodejs;%APPDATA%\npm;%ProgramFiles%\nodejs;%ProgramFiles(x86)%\nodejs

echo 检查Node.js是否已安装...
set NODE_FOUND=0

for %%i in (%NODE_PATHS%) do (
    if exist "%%i\node.exe" (
        set PATH=%%i;%PATH%
        set NODE_FOUND=1
        echo 找到Node.js在: %%i
        goto :NODE_FOUND
    )
)

if %NODE_FOUND%==0 (
    echo 在常见路径未找到Node.js
    echo 尝试在系统PATH中查找...
    where node >nul 2>nul
    if %errorlevel% neq 0 (
        echo Node.js未找到!
        echo 请确保Node.js已正确安装
        pause
        exit /b 1
    )
)

:NODE_FOUND
echo 启动开发服务器...
echo 项目将在http://localhost:5173打开
echo 按Ctrl+C可以停止服务器
echo.

:: 检查node_modules是否存在
if not exist "node_modules" (
    echo node_modules不存在，请先运行install.bat安装依赖
    pause
    exit /b 1
)

:: 使用node_modules中的vite而不是全局vite
cmd.exe /c "npx vite"

pause 