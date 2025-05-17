@echo off
chcp 65001 > nul
echo ===================================
echo 主义主义机(Ismism Machine)查看构建文件
echo ===================================

:: 检查dist目录是否存在
if not exist "dist" (
    echo 未找到dist目录，请先运行"一键构建.bat"构建项目
    pause
    exit /b 1
)

echo 构建文件位于dist目录:
echo.
dir /b dist
echo.
echo 文件总大小:
dir /s dist | findstr "File(s)"
echo.

echo 是否要打开dist文件夹? (Y/N)
set /p OPEN_FOLDER=

if /i "%OPEN_FOLDER%"=="Y" (
    start explorer "%~dp0dist"
)

pause 