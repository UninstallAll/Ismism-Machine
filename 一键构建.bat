@echo off
setlocal enabledelayedexpansion
chcp 65001 > nul
echo ===================================
echo 主义主义机(Ismism Machine)一键构建
echo ===================================

echo 第1步：查找Node.js安装位置...
echo.

set NODE_PATH=
set FOUND=0

:: 直接指定常见的Node.js安装路径
set COMMON_PATHS=C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;C:\nodejs

:: 检查常见安装路径
for %%i in (%COMMON_PATHS:;= %) do (
    if exist "%%i\node.exe" (
        echo 找到Node.js在: %%i
        set NODE_PATH=%%i
        set FOUND=1
        goto :FOUND_NODE
    )
)

:: 如果在常见路径没找到，尝试通过where命令查找
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo Node.js在系统PATH中找到
    for /f "tokens=*" %%i in ('where node') do (
        set NODE_EXE=%%i
        echo 找到node.exe在: %%i
        for %%j in ("%%i\..\..") do (
            set NODE_PATH=%%~dpfj
            echo 提取路径: !NODE_PATH!
        )
        goto :CHECK_NODE_PATH
    )
)

:: 搜索C盘根目录下的node.exe（限制搜索深度，避免过长等待）
echo 正在搜索常见位置的node.exe文件...
for %%i in (C:\Program Files\nodejs\node.exe C:\nodejs\node.exe C:\Program Files (x86)\nodejs\node.exe C:\node\node.exe) do (
    if exist "%%i" (
        echo 找到Node.js在: %%~dpi
        set NODE_PATH=%%~dpi
        set FOUND=1
        goto :FOUND_NODE
    )
)

:CHECK_NODE_PATH
:: 如果路径不正确，尝试直接使用命令
echo 检查提取的路径是否正确...
if not exist "!NODE_PATH!\node.exe" (
    echo 提取的路径不正确，尝试使用系统命令...
    set NODE_PATH=
    set FOUND=0
) else (
    set FOUND=1
    goto :FOUND_NODE
)

:: 如果所有方法都失败，尝试直接使用命令
if %FOUND% equ 0 (
    echo 将使用系统命令而不是完整路径
    set USE_SYSTEM_CMD=1
    goto :USE_SYSTEM_CMD
)

:FOUND_NODE
echo.
echo 使用Node.js路径: !NODE_PATH!
set PATH=!NODE_PATH!;%PATH%

echo.
echo 第2步：检查Node.js版本...
if exist "!NODE_PATH!\node.exe" (
    "!NODE_PATH!\node.exe" -v
) else (
    echo 路径不正确，尝试使用系统命令...
    node -v
)

if %errorlevel% neq 0 (
    echo Node.js测试失败！尝试使用系统命令...
    set USE_SYSTEM_CMD=1
    goto :USE_SYSTEM_CMD
)

echo 检查npm版本...
if exist "!NODE_PATH!\npm.cmd" (
    "!NODE_PATH!\npm.cmd" -v
) else (
    echo 路径不正确，尝试使用系统命令...
    npm -v
)

if %errorlevel% neq 0 (
    echo npm测试失败！尝试使用系统命令...
    set USE_SYSTEM_CMD=1
    goto :USE_SYSTEM_CMD
)

goto :CONTINUE_INSTALL

:USE_SYSTEM_CMD
echo.
echo 将使用系统命令而不是完整路径
echo 检查Node.js是否可用...
node -v
if %errorlevel% neq 0 (
    echo Node.js不可用！请确保Node.js已正确安装并添加到PATH中。
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo 检查npm是否可用...
npm -v
if %errorlevel% neq 0 (
    echo npm不可用！请确保npm已正确安装。
    pause
    exit /b 1
)

:CONTINUE_INSTALL
echo.
echo 第3步：检查依赖是否已安装...
if not exist "node_modules" (
    echo node_modules不存在，正在安装依赖...
    cd /d "%~dp0"
    
    if "!USE_SYSTEM_CMD!"=="1" (
        npm install
    ) else (
        "!NODE_PATH!\npm.cmd" install
    )
    
    if %errorlevel% neq 0 (
        echo 依赖安装失败!
        pause
        exit /b 1
    )
    
    echo 依赖安装成功!
) else (
    echo 依赖已安装，跳过安装步骤。
)

echo.
echo 第4步：构建项目...
echo.

:: 使用找到的Node.js构建项目
cd /d "%~dp0"

if "!USE_SYSTEM_CMD!"=="1" (
    npx tsc && npx vite build
) else (
    "!NODE_PATH!\npx.cmd" tsc && "!NODE_PATH!\npx.cmd" vite build
)

if %errorlevel% neq 0 (
    echo 构建失败!
    pause
    exit /b 1
)

echo.
echo 构建成功!
echo 构建文件位于dist目录
echo.

endlocal
pause 