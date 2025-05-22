#!/usr/bin/env python3
"""
MongoDB Visual Tool - Unified Launcher
Usage: Simply double-click this file or execute python app.py from command line
"""
import os
import sys
import subprocess
import importlib
import time

def print_banner():
    """Display startup banner"""
    banner = """
    ╔═══════════════════════════════════════════════════╗
    ║                                                   ║
    ║          Ismism MongoDB Visual Tool - Launcher    ║
    ║                                                   ║
    ╚═══════════════════════════════════════════════════╝
    """
    print(banner)

def check_python_version():
    """Check Python version"""
    print("[1/4] Checking Python version...")
    if sys.version_info < (3, 6):
        print("Error: Python 3.6 or higher is required")
        return False
    print(f"✓ Python version: {sys.version}")
    return True

def check_dependencies():
    """Check if required libraries are installed"""
    print("[2/4] Checking dependencies...")
    required_packages = {
        'pymongo': '4.6.0',
        'pillow': '10.0.0',  # PIL
        'python-dotenv': '1.0.0',
        'rapidfuzz': '3.13.0'
    }
    
    # Check tkinter
    try:
        import tkinter
        print(f"✓ tkinter installed")
    except ImportError:
        print(f"✗ tkinter not installed, this is a system library, please install Python's tkinter component")
        print("  Windows: Reinstall Python and check tcl/tk option")
        print("  Linux: Use system package manager to install python3-tk")
        print("  macOS: Use Homebrew to install python-tk")
        return False
    
    missing_packages = []
    outdated_packages = []
    
    for package, version in required_packages.items():
        try:
            # Try to import module
            module = importlib.import_module(package)
            
            # Check version (if available)
            if hasattr(module, '__version__'):
                installed_version = module.__version__
                if installed_version != version:
                    print(f"! {package} version mismatch: installed {installed_version}, required {version}")
                    outdated_packages.append((package, version))
                else:
                    print(f"✓ {package} {installed_version} installed")
            else:
                print(f"✓ {package} installed")
                
        except ImportError:
            print(f"✗ {package} not installed")
            missing_packages.append((package, version))
    
    # Install missing packages
    if missing_packages or outdated_packages:
        print("\nThe following libraries need to be installed:")
        for package, version in missing_packages + outdated_packages:
            print(f"- {package}=={version}")
            
        install = input("\nInstall these libraries automatically? (y/n): ")
        if install.lower() == 'y':
            try:
                print("\nInstalling required libraries...")
                
                for package, version in missing_packages + outdated_packages:
                    print(f"Installing {package}=={version}")
                    subprocess.check_call([sys.executable, "-m", "pip", "install", f"{package}=={version}"])
                    
                print("✓ All dependencies installed")
                return True
                
            except Exception as e:
                print(f"Failed to install dependencies: {e}")
                print(f"Recommended manual installation: pip install {' '.join([f'{p}=={v}' for p, v in missing_packages + outdated_packages])}")
                return False
        else:
            print(f"Please install missing libraries manually: pip install {' '.join([f'{p}=={v}' for p, v in missing_packages + outdated_packages])}")
            return False
    
    print("✓ All dependencies correctly installed")
    return True

def check_modules():
    """Check if application modules are complete"""
    print("[3/4] Checking application modules...")
    
    # Check required files and directories
    required_files = [
        "main.py",
        "modules/__init__.py",
        "modules/config/__init__.py",
        "modules/config/settings.py",
        "modules/config/config_manager.py",
        "modules/db/__init__.py",
        "modules/db/mongo_manager.py",
        "modules/db/validator.py",
        "modules/ui/__init__.py",
        "modules/ui/image_card.py",
        "modules/ui/paginated_grid.py",
        "modules/utils/__init__.py",
        "modules/utils/image_loader.py",
    ]
    
    # Get current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    missing_files = []
    for file_path in required_files:
        full_path = os.path.join(current_dir, file_path)
        if not os.path.exists(full_path):
            missing_files.append(file_path)
    
    if missing_files:
        print(f"Error: The following application files are missing:")
        for file in missing_files:
            print(f"  - {file}")
        return False
    
    print("✓ All application modules complete")
    return True

def start_application():
    """Start the main application"""
    print("[4/4] Starting application...")
    
    # Get current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Main application file path
    main_py = os.path.join(current_dir, "main.py")
    
    # Ensure it exists
    if not os.path.exists(main_py):
        print(f"Error: Main program file does not exist: {main_py}")
        return False
    
    try:
        # Use current Python interpreter to run application
        subprocess.run([sys.executable, main_py], check=True)
        print("Application closed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Application execution error: {e}")
        return False
    except KeyboardInterrupt:
        print("\nProgram interrupted by user")
        return True

def main():
    """Main function"""
    print_banner()
    
    # Check environment
    if not check_python_version():
        input("Press Enter to exit...")
        return 1
    
    # Check dependencies
    if not check_dependencies():
        input("Press Enter to exit...")
        return 1
    
    # Check application modules
    if not check_modules():
        input("Press Enter to exit...")
        return 1
    
    # Start application
    if not start_application():
        input("Press Enter to exit...")
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = main()
    # On Windows, if running by double-clicking, give user time to see results
    if os.name == 'nt' and not sys.stdin.isatty():
        print("\nProgram execution completed, closing in 3 seconds...")
        time.sleep(3)
    sys.exit(exit_code) 