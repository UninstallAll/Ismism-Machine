#!/usr/bin/env python3
"""
Ismism 数据库可视化工具 - 一体化启动器
使用方法: 直接双击此文件或在命令行中执行 python ismism_db_tool.py
"""
import os
import sys
import subprocess
import platform

def print_banner():
    """显示启动横幅"""
    banner = """
    ╔═══════════════════════════════════════════════════╗
    ║                                                   ║
    ║          Ismism数据库可视化工具 - 启动器          ║
    ║                                                   ║
    ╚═══════════════════════════════════════════════════╝
    """
    print(banner)

def check_python_version():
    """检查Python版本"""
    if sys.version_info < (3, 6):
        print("错误: 需要Python 3.6或更高版本")
        return False
    return True

def check_dependencies():
    """检查必要的依赖库是否已安装"""
    required_packages = ['pymongo', 'pillow', 'tkinter']
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'tkinter':
                import tkinter
            elif package == 'pillow':
                from PIL import Image
            elif package == 'pymongo':
                import pymongo
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"缺少必要的库: {', '.join(missing_packages)}")
        install = input("是否自动安装这些库? (y/n): ")
        if install.lower() == 'y':
            for package in missing_packages:
                if package == 'pillow':
                    package = 'Pillow'  # 安装时包名大小写敏感
                subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print("库安装完成!")
        else:
            print(f"请手动安装缺少的库: pip install {' '.join(missing_packages)}")
            return False
    
    return True

def get_project_root():
    """尝试找到项目根目录"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 检测是否已在tools/mongodb_visual_tool目录下
    if os.path.basename(current_dir) == 'mongodb_visual_tool' and os.path.basename(os.path.dirname(current_dir)) == 'tools':
        # 向上两级即为项目根目录
        return os.path.dirname(os.path.dirname(current_dir))
    
    # 检查当前目录下是否有'auto_connect_app.py'
    if os.path.exists(os.path.join(current_dir, 'auto_connect_app.py')):
        # 可能当前就在mongodb_visual_tool目录下
        parent_dir = os.path.dirname(current_dir)
        if os.path.basename(parent_dir) == 'tools':
            return os.path.dirname(parent_dir)
    
    # 在当前目录及其父目录尝试查找项目标志性文件
    max_levels = 3  # 最多向上查找3级
    test_dir = current_dir
    
    for _ in range(max_levels):
        # 检查是否是项目根目录 (存在src, public等典型目录)
        if (os.path.exists(os.path.join(test_dir, 'public')) and 
            os.path.exists(os.path.join(test_dir, 'server'))):
            return test_dir
        
        parent = os.path.dirname(test_dir)
        if parent == test_dir:  # 已到达根目录
            break
        test_dir = parent
    
    # 如果找不到，则使用当前目录
    return current_dir

def start_tool():
    """启动主应用程序"""
    # 找到auto_connect_app.py文件
    current_dir = os.path.dirname(os.path.abspath(__file__))
    app_path = os.path.join(current_dir, 'auto_connect_app.py')
    
    if not os.path.exists(app_path):
        print(f"错误: 无法找到应用程序文件 {app_path}")
        
        # 尝试在其他位置查找
        project_root = get_project_root()
        alternative_path = os.path.join(project_root, 'tools', 'mongodb_visual_tool', 'auto_connect_app.py')
        
        if os.path.exists(alternative_path):
            print(f"在另一位置找到应用程序: {alternative_path}")
            app_path = alternative_path
        else:
            print("无法找到应用程序文件。请确保您从正确的目录启动此脚本。")
            input("按Enter键退出...")
            return False
    
    # 运行应用程序
    print(f"正在启动数据库可视化工具...")
    
    # 切换工作目录到应用程序所在目录
    os.chdir(os.path.dirname(app_path))
    
    try:
        # 使用当前Python解释器运行应用程序
        subprocess.run([sys.executable, app_path], check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"应用程序运行出错: {e}")
        input("按Enter键退出...")
        return False
    except KeyboardInterrupt:
        print("\n程序被用户中断")
        return True

def main():
    """主函数"""
    print_banner()
    
    # 检查环境
    if not check_python_version():
        input("按Enter键退出...")
        return
    
    # 检查依赖库
    if not check_dependencies():
        input("按Enter键退出...")
        return
    
    # 启动工具
    start_tool()

if __name__ == "__main__":
    main() 