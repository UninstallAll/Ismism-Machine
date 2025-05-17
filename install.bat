@echo off
setlocal enabledelayedexpansion

echo ==================================================
echo            主义主义机 - 安装与运行工具
echo ==================================================
echo.

:: 检查Node.js安装
call :check_nodejs
if %errorlevel% neq 0 (
    echo 未检测到Node.js，请先安装Node.js（推荐v18.12.1或更高版本）
    echo 可以从 https://nodejs.org 下载安装，或使用nvm管理Node.js版本
    pause
    exit /b 1
)

:: 显示菜单
:menu
cls
echo 请选择要执行的操作:
echo.
echo [1] 安装依赖并启动开发环境
echo [2] 构建项目
echo [3] 预览构建结果
echo [4] 使用Docker启动开发环境
echo [5] 构建Docker镜像并运行
echo [0] 退出
echo.

set /p choice="请输入数字选择操作: "

if "%choice%"=="1" (
    call :install_and_start
) else if "%choice%"=="2" (
    call :build_project
) else if "%choice%"=="3" (
    call :preview_build
) else if "%choice%"=="4" (
    call :docker_dev
) else if "%choice%"=="5" (
    call :docker_build
) else if "%choice%"=="0" (
    exit /b 0
) else (
    echo 无效的选择，请重新输入
    timeout /t 2 >nul
    goto menu
)

goto menu

:: 检查Node.js是否安装
:check_nodejs
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 未找到Node.js
    exit /b 1
)

echo 已检测到Node.js版本:
node -v
exit /b 0

:: 安装依赖并启动开发环境
:install_and_start
echo.
echo 正在安装依赖...
call npm install

if %errorlevel% neq 0 (
    echo 依赖安装失败，请检查错误信息
    pause
    exit /b 1
)

echo.
echo 启动开发服务器...
call npm run dev

exit /b 0

:: 构建项目
:build_project
echo.
echo 正在构建项目...
call npm run build

if %errorlevel% neq 0 (
    echo 构建失败，请检查错误信息
    pause
    exit /b 1
)

echo.
echo 构建完成！构建文件位于 dist 目录
pause
exit /b 0

:: 预览构建结果
:preview_build
echo.
if not exist "dist" (
    echo 构建文件夹不存在，请先构建项目
    pause
    exit /b 1
)

echo 启动预览服务器...
call npm run preview

exit /b 0

:: 使用Docker启动开发环境
:docker_dev
echo.
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo 未找到Docker，请确保已安装Docker
    echo 可以从 https://www.docker.com/products/docker-desktop 下载安装
    pause
    exit /b 1
)

echo 使用Docker Compose启动开发环境...
docker-compose up

exit /b 0

:: 构建Docker镜像并运行
:docker_build
echo.
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo 未找到Docker，请确保已安装Docker
    echo 可以从 https://www.docker.com/products/docker-desktop 下载安装
    pause
    exit /b 1
)

echo 构建Docker镜像...
docker build -t ismism-machine:latest .

if %errorlevel% neq 0 (
    echo Docker镜像构建失败
    pause
    exit /b 1
)

echo 运行Docker容器...
docker run -d -p 80:80 --name ismism-machine ismism-machine:latest

if %errorlevel% neq 0 (
    echo Docker容器启动失败
    pause
    exit /b 1
)

echo.
echo Docker容器启动成功，请访问 http://localhost 查看应用
pause
exit /b 0 