#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MongoDB Visual Tool - Main Program Entry

Usage: python main.py
"""
import os
import sys
import logging

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from src.core.app import MongoDBViewer

def main():
    """Main function"""
    try:
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Create and run application
        app = MongoDBViewer()
        app.mainloop()
        
    except Exception as e:
        logging.error(f"Application error: {e}")
        import traceback
        traceback.print_exc()
        
        # Display error in GUI
        try:
            import tkinter as tk
            from tkinter import messagebox
            root = tk.Tk()
            root.withdraw()
            messagebox.showerror("Startup Error", f"Application failed to start: {e}")
            root.destroy()
        except:
            print(f"Application failed to start: {e}")
        
        sys.exit(1)

if __name__ == "__main__":
    main() 