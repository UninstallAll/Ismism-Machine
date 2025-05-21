#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MongoDB Visual Tool - Launcher

Check environment and start the application
"""
import os
import sys
import subprocess
import platform

def print_banner():
    """Display launch banner"""
    banner = """
    ╔═══════════════════════════════════════════════════╗
    ║                                                   ║
    ║          MongoDB Visual Tool - Launcher           ║
    ║                                                   ║
    ╚═══════════════════════════════════════════════════╝
    """
    print(banner)

def check_python_version():
    """Check Python version
    
    Returns:
        bool: Returns True if Python version meets requirements, False otherwise
    """
    if sys.version_info < (3, 6):
        print("Error: Python 3.6 or higher is required")
        return False
    
    print(f"✓ Python version check passed: {platform.python_version()}")
    return True

def check_dependencies():
    """Check if necessary dependencies are installed
    
    Returns:
        bool: Returns True if all dependencies are installed, False otherwise
    """
    required_packages = ['pymongo', 'pillow', 'tkinter']
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'tkinter':
                import tkinter
                print(f"✓ Installed {package} ({tkinter.TkVersion})")
            elif package == 'pillow':
                from PIL import Image, __version__
                print(f"✓ Installed {package} ({__version__})")
            elif package == 'pymongo':
                import pymongo
                print(f"✓ Installed {package} ({pymongo.version})")
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"Missing required libraries: {', '.join(missing_packages)}")
        
        try:
            install = input("Do you want to install these libraries automatically? (y/n): ")
            if install.lower() == 'y':
                for package in missing_packages:
                    pip_package = package
                    if package == 'pillow':
                        pip_package = 'Pillow'  # Package name is case-sensitive for installation
                    
                    print(f"Installing {pip_package}...")
                    subprocess.check_call([sys.executable, "-m", "pip", "install", pip_package])
                
                print("All libraries installed!")
                return True
            else:
                print(f"Please manually install the missing libraries: pip install {' '.join(missing_packages)}")
                return False
        except Exception as e:
            print(f"Failed to install dependencies: {e}")
            print(f"Please manually install the missing libraries: pip install {' '.join(missing_packages)}")
            return False
    
    print("✓ All required dependencies are installed")
    return True

def find_main_script():
    """Find main program script
    
    Returns:
        str: Path to the main program script, or None if not found
    """
    # Current script directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Check for main.py in the current directory
    main_path = os.path.join(current_dir, 'main.py')
    if os.path.exists(main_path):
        print(f"✓ Found main program: {main_path}")
        return main_path
    
    print("Error: Main program file not found")
    return None

def start_application(main_script):
    """Start the application
    
    Args:
        main_script (str): Path to the main program script
    
    Returns:
        bool: Returns True if startup successful, False if failed
    """
    try:
        print(f"Starting application: {main_script}")
        
        # Change to the directory containing the main script
        script_dir = os.path.dirname(os.path.abspath(main_script))
        os.chdir(script_dir)
        
        # Run the main program
        subprocess.run([sys.executable, main_script], check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Application runtime error: {e}")
        return False
    except Exception as e:
        print(f"Error starting application: {e}")
        return False

def main():
    """Main function"""
    print_banner()
    
    if not check_python_version():
        input("Press Enter to exit...")
        return
    
    if not check_dependencies():
        input("Press Enter to exit...")
        return
    
    main_script = find_main_script()
    if not main_script:
        input("Press Enter to exit...")
        return
    
    print("\nPreparing to start application...")
    success = start_application(main_script)
    
    if not success:
        input("\nApplication could not be started. Press Enter to exit...")

if __name__ == "__main__":
    main() 