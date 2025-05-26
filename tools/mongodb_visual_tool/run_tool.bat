@echo off
echo MongoDB Visual Tool 启动中...

:: 尝试激活虚拟环境
if exist venv\Scripts\activate.bat (
  echo 激活虚拟环境...
  call venv\Scripts\activate.bat
) else if exist .venv\Scripts\activate.bat (
  echo 激活虚拟环境...
  call .venv\Scripts\activate.bat
) else (
  echo 警告: 未找到虚拟环境，使用系统Python
)

:: 运行应用程序
echo 运行应用程序...
python main.py

:: 保持窗口打开
if %ERRORLEVEL% NEQ 0 (
  echo 应用程序异常退出，错误代码: %ERRORLEVEL%
  pause
)

:: 如果已激活虚拟环境，则退出
if defined VIRTUAL_ENV (
  deactivate
) 