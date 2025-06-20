@echo off
echo ========================================
echo Setting up Art Movements Database
echo ========================================

rem 确保MongoDB服务正在运行
echo Checking MongoDB service...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
  echo MongoDB not found or not in PATH. Please ensure MongoDB is installed and running.
  exit /b 1
)

echo MongoDB is available.

rem 创建database目录（如果不存在）
if not exist ".\database\db" (
  echo Creating database directory...
  mkdir ".\database\db"
)

rem 启动MongoDB服务（可选，如果服务尚未运行）
rem start "MongoDB" mongod --dbpath=".\database\db"

rem 导入所有当代艺术主义数据
echo Importing all contemporary art movements from text file...
node scripts/seedAllArtMovements.js

echo.
echo ========================================
echo Database setup complete!
echo ========================================
echo.
echo You can now run the server with:
echo npm run server
echo.
echo Access the API at http://localhost:5000/api/art-movements

pause 