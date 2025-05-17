@echo off
chcp 65001 > nul
echo ===================================
echo 主义主义机(Ismism Machine)环境配置
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
        echo 可以从以下地址下载: https://nodejs.org/
        pause
        exit /b 1
    )
)

:NODE_FOUND
echo Node.js版本:
node -v

echo 检查npm是否已安装...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo npm未安装!
    echo 请确保npm与Node.js一起安装
    pause
    exit /b 1
)

echo npm版本:
npm -v

echo.
echo 安装项目依赖...

:: 使用cmd.exe执行npm命令，避免PowerShell执行策略问题
cmd.exe /c "npm install"

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