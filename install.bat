@echo off
setlocal enabledelayedexpansion

echo ==================================================
echo            Ismism Machine - Installation Tool
echo ==================================================
echo.

:: Check Node.js installation
call :check_nodejs
if %errorlevel% neq 0 (
    echo Node.js not detected. Please install Node.js (recommended v18.12.1 or higher)
    echo Download from https://nodejs.org or use nvm to manage Node.js versions
    pause
    exit /b 1
)

:: Display menu
:menu
cls
echo Please select an operation:
echo.
echo [1] Install dependencies and start development environment
echo [2] Build project
echo [3] Preview build result
echo [4] Start development environment using Docker
echo [5] Build Docker image and run
echo [0] Exit
echo.

set /p choice="Enter number to select operation: "

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
    echo Invalid selection, please try again
    timeout /t 2 >nul
    goto menu
)

goto menu

:: Check if Node.js is installed
:check_nodejs
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js not found
    exit /b 1
)

echo Node.js version detected:
node -v
exit /b 0

:: Install dependencies and start development environment
:install_and_start
echo.
echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo Dependency installation failed. Please check error messages
    pause
    exit /b 1
)

echo.
echo Starting development server...
call npm run dev

exit /b 0

:: Build project
:build_project
echo.
echo Building project...
call npm run build

if %errorlevel% neq 0 (
    echo Build failed. Please check error messages
    pause
    exit /b 1
)

echo.
echo Build complete! Build files are in the dist directory
pause
exit /b 0

:: Preview build result
:preview_build
echo.
if not exist "dist" (
    echo Build directory does not exist. Please build the project first
    pause
    exit /b 1
)

echo Starting preview server...
call npm run preview

exit /b 0

:: Start development environment using Docker
:docker_dev
echo.
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo Docker not found. Please ensure Docker is installed
    echo Download from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Starting development environment using Docker Compose...
docker-compose up

exit /b 0

:: Build Docker image and run
:docker_build
echo.
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo Docker not found. Please ensure Docker is installed
    echo Download from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Building Docker image...
docker build -t ismism-machine:latest .

if %errorlevel% neq 0 (
    echo Docker image build failed
    pause
    exit /b 1
)

echo Running Docker container...
docker run -d -p 80:80 --name ismism-machine ismism-machine:latest

if %errorlevel% neq 0 (
    echo Docker container startup failed
    pause
    exit /b 1
)

echo.
echo Docker container started successfully. Visit http://localhost to view the application
pause
exit /b 0 