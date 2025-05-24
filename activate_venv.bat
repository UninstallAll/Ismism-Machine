@echo off
REM 检测是否在PowerShell中运行
where powershell >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    powershell -NoProfile -ExecutionPolicy Bypass -Command ".\.venv\Scripts\Activate.ps1"
) else (
    call .\.venv\Scripts\activate.bat
) 