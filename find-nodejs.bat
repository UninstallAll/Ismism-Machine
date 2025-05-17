@echo off
chcp 65001 > nul
echo ===================================
echo 查找Node.js安装位置
echo ===================================

echo 检查系统环境变量中的Node.js...
where node 2>nul
if %errorlevel% equ 0 (
    echo.
    echo Node.js在系统PATH中找到
    echo 版本信息:
    node -v
    goto :END
)

echo 在系统PATH中未找到Node.js，开始在常见路径搜索...
echo.

set FOUND=0

:: 检查常见安装路径
set PATHS=C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;C:\nodejs;%APPDATA%\npm;%ProgramFiles%\nodejs;%ProgramFiles(x86)%\nodejs;C:\Program Files\nodejs\node.exe;C:\Program Files (x86)\nodejs\node.exe;C:\nodejs\node.exe

for %%i in (%PATHS%) do (
    if exist "%%i\node.exe" (
        echo 找到Node.js在: %%i\node.exe
        set FOUND=1
    ) else if exist "%%i" (
        if "%%~xi" == ".exe" (
            echo 找到Node.js在: %%i
            set FOUND=1
        )
    )
)

:: 搜索C盘根目录下的node.exe
echo 搜索C盘根目录下的node.exe文件...
for /r C:\ %%i in (node.exe) do (
    if exist "%%i" (
        echo 找到Node.js在: %%i
        set FOUND=1
    )
)

if %FOUND% equ 0 (
    echo.
    echo 未找到Node.js安装。
    echo 请确保Node.js已正确安装，或手动指定Node.js路径。
)

:END
echo.
echo 搜索完成。
pause 