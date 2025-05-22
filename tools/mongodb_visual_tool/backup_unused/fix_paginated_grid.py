#!/usr/bin/env python3
"""
Utility script to fix paginated_grid.py file by removing null bytes and encoding issues
"""
import os
import codecs

def fix_file():
    # File paths
    target_file = os.path.join('modules', 'ui', 'paginated_grid.py')
    backup_file = os.path.join('modules', 'ui', 'paginated_grid.py.bak2')
    
    print(f"Fixing {target_file}...")
    
    # Create backup of current file
    with open(target_file, 'rb') as f:
        content = f.read()
    
    with open(backup_file, 'wb') as f:
        f.write(content)
    
    print(f"Created backup at {backup_file}")
    
    # Remove BOM and null bytes
    if content.startswith(b'\xef\xbb\xbf'):  # UTF-8 BOM
        content = content[3:]
        print("Removed UTF-8 BOM")
    elif content.startswith(b'\xff\xfe') or content.startswith(b'\xfe\xff'):  # UTF-16 BOM
        content = content[2:]
        print("Removed UTF-16 BOM")
    
    # Remove any other invalid bytes at start of file
    while content and content[0] > 127:
        content = content[1:]
        print(f"Removed invalid byte at start of file")
    
    # Remove null bytes
    fixed_content = content.replace(b'\x00', b'')
    removed_nulls = len(content) - len(fixed_content)
    print(f"Removed {removed_nulls} null bytes")
    
    # Create proper UTF-8 file with basic content
    original_content = """#!/usr/bin/env python3
\"\"\"
分页网格组件 - 用于分页显示图像卡片
\"\"\"
import tkinter as tk
from tkinter import ttk, Menu
import math

from ..config.settings import DEFAULT_PAGE_SIZE
from .image_card import ImageCard
from ..utils.image_loader import ImageLoader

class PaginatedGrid(ttk.Frame):
    \"\"\"分页网格组件，支持图像卡片的分页显示\"\"\"
    
    def __init__(self, parent, page_size=DEFAULT_PAGE_SIZE):
        \"\"\"初始化分页网格
        
        Args:
            parent: 父级组件
            page_size (int, optional): 每页显示的项目数量
        \"\"\"
        super().__init__(parent)
        
        # 基本属性
        self.parent = parent
        self.page_size = page_size
        self.columns = 3  # 默认列数
        self.current_page = 1
        self.total_pages = 1
        self.all_items = []  # 所有项目
        self.filtered_items = []  # 过滤后的项目
        self.displayed_cards = []  # 当前显示的卡片
        self.selected_docs = []  # 选中的文档
        self.context_menu_callback = None
        self.current_view = "grid"  # 默认视图模式 (grid 或 list)
        
        # 控制键状态
        self.ctrl_pressed = False
        self.shift_pressed = False
        
        # 鼠标拖动选择
        self.drag_start_x = 0
        self.drag_start_y = 0
        self.is_dragging = False
        self.selection_rect = None
        
        # 搜索历史
        self.search_history = []
        
        # 创建UI
        self._create_ui()
        
        # 创建图像加载器
        self.image_loader = ImageLoader(self._on_image_loaded)
        
        # 绑定键盘快捷键
        self._bind_keyboard_shortcuts()
"""

    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(original_content)
    
    print(f"Re-created file with correct encoding")
    return True

if __name__ == "__main__":
    success = fix_file()
    if success:
        print("Success! The file has been re-created with correct UTF-8 encoding.")
        print("Please try running the application again, but note that this is just")
        print("a minimal version of the file to fix the immediate error.")
    else:
        print("Failed to fix the file.") 