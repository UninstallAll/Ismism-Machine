@echo off
echo 正在初始化艺术数据库...

REM 运行MongoDB脚本
mongosh --file init_art_db.js

echo 数据库初始化完成！
pause 