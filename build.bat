@echo off
chcp 65001 > nul
echo ===================================
echo 主义主义机(Ismism Machine)项目构建
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
echo 构建项目...
echo.

:: 检查node_modules是否存在
if not exist "node_modules" (
    echo node_modules不存在，请先运行install.bat安装依赖
    pause
    exit /b 1
)

:: 使用npx运行构建命令
cmd.exe /c "npx tsc && npx vite build"

if %errorlevel% neq 0 (
    echo 构建失败!
    pause
    exit /b 1
)

echo.
echo 构建成功!
echo 构建文件位于dist目录
echo.

pause 