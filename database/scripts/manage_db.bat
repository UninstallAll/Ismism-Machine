@echo off
setlocal enabledelayedexpansion

:menu
cls
echo === 艺术数据库管理系统 ===
echo.
echo 1. 初始化数据库
echo 2. 备份数据库
echo 3. 恢复数据库
echo 4. 维护数据库
echo 5. 退出
echo.
set /p choice=请选择操作 (1-5): 

if "%choice%"=="1" (
    echo 正在初始化数据库...
    mongosh --file mongodb_operations.js
    pause
    goto menu
)

if "%choice%"=="2" (
    echo 正在备份数据库...
    mongodump --db art_db --out ./backup
    echo 备份完成！
    pause
    goto menu
)

if "%choice%"=="3" (
    echo 正在恢复数据库...
    mongorestore --db art_db ./backup/art_db
    echo 恢复完成！
    pause
    goto menu
)

if "%choice%"=="4" (
    echo 正在维护数据库...
    mongosh --eval "db.getSiblingDB('art_db').runCommand({ compact: 'artworks' })"
    mongosh --eval "db.getSiblingDB('art_db').runCommand({ compact: 'artists' })"
    mongosh --eval "db.getSiblingDB('art_db').runCommand({ compact: 'art_movements' })"
    mongosh --eval "db.getSiblingDB('art_db').repairDatabase()"
    echo 维护完成！
    pause
    goto menu
)

if "%choice%"=="5" (
    echo 再见！
    exit /b 0
)

echo 无效选择，请重试...
pause
goto menu 