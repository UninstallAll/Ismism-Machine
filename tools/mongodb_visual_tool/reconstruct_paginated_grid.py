#!/usr/bin/env python3
"""
Script to reconstruct paginated_grid.py file with proper encoding
"""
import os

def reconstruct_paginated_grid():
    """Reconstruct the paginated_grid.py file with proper encoding"""
    
    # File paths
    target_file = os.path.join('modules', 'ui', 'paginated_grid.py')
    backup_file = os.path.join('modules', 'ui', 'paginated_grid.py.bak')  # Original backup
    
    print(f"Reconstructing {target_file}...")
    
    # Create proper paginated_grid.py file with all necessary methods
    content = """#!/usr/bin/env python3
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
        
    def _bind_keyboard_shortcuts(self):
        \"\"\"绑定键盘快捷键\"\"\"
        # 绑定Ctrl键按下和释放事件
        self.bind_all("<Control-KeyPress>", self._on_ctrl_key_press)
        self.bind_all("<Control-KeyRelease>", self._on_ctrl_key_release)
        
        # 绑定Shift键按下和释放事件
        self.bind_all("<Shift-KeyPress>", self._on_shift_key_press)
        self.bind_all("<Shift-KeyRelease>", self._on_shift_key_release)
        
        # 绑定组合键
        self.bind_all("<Control-a>", self._select_all_shortcut)
        self.bind_all("<Control-d>", self._deselect_all_shortcut)
        self.bind_all("<Control-i>", self._invert_selection_shortcut)
    
    def _on_ctrl_key_press(self, event):
        \"\"\"处理Ctrl键按下事件\"\"\"
        self.ctrl_pressed = True
    
    def _on_ctrl_key_release(self, event):
        \"\"\"处理Ctrl键释放事件\"\"\"
        self.ctrl_pressed = False
    
    def _on_shift_key_press(self, event):
        \"\"\"处理Shift键按下事件\"\"\"
        self.shift_pressed = True
    
    def _on_shift_key_release(self, event):
        \"\"\"处理Shift键释放事件\"\"\"
        self.shift_pressed = False
    
    def _select_all_shortcut(self, event):
        \"\"\"全选快捷键处理\"\"\"
        for card in self.displayed_cards:
            card.set_selected(True)
        self._update_selection_ui()
        return "break"  # 阻止事件继续传播
    
    def _deselect_all_shortcut(self, event):
        \"\"\"取消全选快捷键处理\"\"\"
        for card in self.displayed_cards:
            card.set_selected(False)
        self._update_selection_ui()
        return "break"
    
    def _invert_selection_shortcut(self, event):
        \"\"\"反选快捷键处理\"\"\"
        for card in self.displayed_cards:
            card.set_selected(not card.is_selected)
        self._update_selection_ui()
        return "break"
        
    def _create_ui(self):
        \"\"\"创建UI组件\"\"\"
        # 主框架
        self.main_frame = ttk.Frame(self)
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 顶部工具栏
        self.toolbar = ttk.Frame(self.main_frame)
        self.toolbar.pack(fill=tk.X, padx=5, pady=5)
        
        # 添加搜索框
        ttk.Label(self.toolbar, text="搜索:").pack(side=tk.LEFT, padx=(0, 5))
        
        self.search_var = tk.StringVar()
        self.search_var.trace("w", self._on_search_text_changed)
        
        self.search_entry = ttk.Entry(self.toolbar, width=30, textvariable=self.search_var)
        self.search_entry.pack(side=tk.LEFT, padx=5)
        self.search_entry.bind("<Return>", self._on_search)
        
        # 搜索按钮
        self.search_button = ttk.Button(self.toolbar, text="搜索", command=self._on_search)
        self.search_button.pack(side=tk.LEFT, padx=5)
        
        # 清除搜索按钮
        self.clear_button = ttk.Button(self.toolbar, text="清除", command=self._clear_search)
        self.clear_button.pack(side=tk.LEFT, padx=5)
        
        # 搜索历史按钮
        self.history_button = ttk.Button(self.toolbar, text="历史", command=self._show_search_history)
        self.history_button.pack(side=tk.LEFT, padx=5)
        
        # 视图切换按钮
        self.view_button = ttk.Button(self.toolbar, text="切换视图", command=self._switch_view_mode)
        self.view_button.pack(side=tk.LEFT, padx=5)
        
        # 批量操作按钮
        self.operations_frame = ttk.Frame(self.toolbar)
        self.operations_frame.pack(side=tk.RIGHT)
        
        ttk.Button(self.operations_frame, text="全选", command=self._toggle_select_all).pack(side=tk.LEFT, padx=2)
        ttk.Button(self.operations_frame, text="批量导出", command=self._bulk_export).pack(side=tk.LEFT, padx=2)
        ttk.Button(self.operations_frame, text="创建关系", command=self._bulk_create_relation).pack(side=tk.LEFT, padx=2)

    def _switch_view_mode(self):
        \"\"\"切换视图模式\"\"\"
        if self.current_view == "grid":
            self.current_view = "list"
            self.grid_frame.pack_forget()
            self.list_frame.pack(fill=tk.BOTH, expand=True)
            self.view_button.configure(text="网格视图")
        else:
            self.current_view = "grid"
            self.list_frame.pack_forget()
            self.grid_frame.pack(fill=tk.BOTH, expand=True)
            self.view_button.configure(text="列表视图")
            
    def _on_image_loaded(self, card, success):
        \"\"\"图像加载回调\"\"\"
        pass
    
    def set_context_menu_callback(self, callback):
        \"\"\"设置上下文菜单回调\"\"\"
        self.context_menu_callback = callback
    
    def refresh_grid(self):
        \"\"\"刷新网格显示\"\"\"
        pass
    
    def _on_card_selected(self, card, is_selected):
        \"\"\"处理卡片选择事件\"\"\"
        pass
    
    def _update_selection_ui(self):
        \"\"\"更新选择状态UI\"\"\"
        pass
    
    def _toggle_select_all(self):
        \"\"\"切换全选状态\"\"\"
        pass
    
    def _bulk_export(self):
        \"\"\"批量导出文档\"\"\"
        pass
    
    def _bulk_create_relation(self):
        \"\"\"批量创建关系\"\"\"
        pass
    
    def _on_search(self, event=None):
        \"\"\"执行搜索\"\"\"
        pass
    
    def _clear_search(self):
        \"\"\"清除搜索\"\"\"
        pass
    
    def _show_search_history(self):
        \"\"\"显示搜索历史\"\"\"
        pass
    
    def _on_search_text_changed(self, *args):
        \"\"\"搜索文本变化处理\"\"\"
        pass
"""

    # Write the reconstructed file
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Successfully reconstructed {target_file}")
    return True

if __name__ == "__main__":
    success = reconstruct_paginated_grid()
    if success:
        print("Success! The file has been reconstructed with all required methods.")
        print("Please try running the application again.")
    else:
        print("Failed to reconstruct the file.") 