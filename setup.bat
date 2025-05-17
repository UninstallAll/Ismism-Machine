@echo off
echo ===================================
echo 主义主义机项目安装与启动脚本
echo ===================================

echo 检查Node.js是否已安装...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js未安装!
    echo 请先安装Node.js (v14+)
    echo 可以从以下地址下载: https://nodejs.org/
    pause
    exit /b 1
)

echo 检查npm是否已安装...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo npm未安装!
    echo 请确保npm与Node.js一起安装
    pause
    exit /b 1
)

echo Node.js版本:
node -v

echo npm版本:
npm -v

echo.
echo 安装项目依赖...
call npm install

if %errorlevel% neq 0 (
    echo 依赖安装失败!
    pause
    exit /b 1
)

echo.
echo 依赖安装成功!

echo.
echo 启动开发服务器...
echo 项目将在http://localhost:5173打开
echo 按Ctrl+C可以停止服务器
echo.

call npm run dev

pause 