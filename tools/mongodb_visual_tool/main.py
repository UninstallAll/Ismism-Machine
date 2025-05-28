#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MongoDB Visual Tool - Main Program Entry

Usage: python main.py
"""
import os
import sys
import logging
import traceback

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

def setup_logging():
    """配置日志记录"""
    try:
        log_dir = os.path.join(current_dir, "logs")
        os.makedirs(log_dir, exist_ok=True)
        
        log_file = os.path.join(log_dir, "app.log")
        
        # 配置根日志记录器
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file, encoding='utf-8'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        
        # 将第三方库的日志级别设置为WARNING
        logging.getLogger("PIL").setLevel(logging.WARNING)
        logging.getLogger("pymongo").setLevel(logging.WARNING)
        
        return True
    except Exception as e:
        print(f"Failed to setup logging: {e}")
        return False

def show_error_dialog(message):
    """显示错误对话框"""
    try:
        import tkinter as tk
        from tkinter import messagebox
        
        root = tk.Tk()
        root.withdraw()
        messagebox.showerror("应用程序错误", message)
        root.destroy()
    except Exception as e:
        print(f"无法显示错误对话框: {e}")
        print(f"原始错误: {message}")

def main():
    """Main function"""
    try:
        # 配置日志记录
        setup_logging()
        
        # 导入应用程序类
        from src.core.app import MongoDBViewer
        
        # 创建并运行应用程序
        app = MongoDBViewer()
        app.mainloop()
        
        # 正常退出
        return 0
        
    except ImportError as e:
        error_msg = f"导入错误: {e}\n可能是缺少所需的Python库。"
        logging.error(error_msg)
        logging.error(traceback.format_exc())
        show_error_dialog(error_msg)
        return 1
        
    except Exception as e:
        error_msg = f"应用程序启动失败: {e}"
        logging.error(error_msg)
        logging.error(traceback.format_exc())
        show_error_dialog(error_msg)
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code) 