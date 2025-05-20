#!/usr/bin/env python3
import sys
import os
import tkinter as tk
from tkinter import ttk, messagebox, filedialog, Canvas, Menu
from tkinter.scrolledtext import ScrolledText
import pymongo
from PIL import Image, ImageTk
from bson.objectid import ObjectId
import json
import math
import threading
import queue
import time
import datetime  # 添加datetime模块引用
from auto_config import DEFAULT_MONGODB_URI, AUTO_CONNECT, DEFAULT_DATABASE, DEFAULT_GRID_COLUMNS, DEFAULT_PAGE_SIZE, WINDOW_SIZE, RELATIONSHIP_TYPES

# 添加配置文件路径
CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "user_config.json")

# 默认配置
DEFAULT_CONFIG = {
    "last_db": "",
    "last_collection": "",
    "auto_connect": AUTO_CONNECT,
    "mongodb_uri": DEFAULT_MONGODB_URI,
    "grid_columns": DEFAULT_GRID_COLUMNS
}

# 加载用户配置
def load_user_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading config: {e}")
    return DEFAULT_CONFIG

# 保存用户配置
def save_user_config(config):
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
    except Exception as e:
        print(f"Error saving config: {e}")

class ImageCard(ttk.Frame):
    """A component to display an image with its metadata"""
    def __init__(self, parent, doc=None, width=200, height=200, on_select_callback=None):
        super().__init__(parent)
        
        self.width = width
        self.height = height
        self.doc = doc or {}
        self.metadata = {}
        self.image_path = None
        self.image = None
        self.is_selected = False  # 选中状态标志
        self.on_select_callback = on_select_callback
        
        # 默认背景色
        default_bg = "#f0f0f0"
        
        # 为了保持一致的卡片大小，创建一个额外的固定尺寸容器
        # 无论内容如何变化，这个容器都会保持固定尺寸
        self.container = tk.Frame(self, width=width, height=height+80)
        self.container.pack(fill=tk.BOTH, expand=True)
        self.container.pack_propagate(False)  # 防止容器大小变化
        
        # 创建主框架 - 使用tk.Frame以便能直接设置背景色
        # 使用略微可见的边框以便区分各卡片
        self.main_frame = tk.Frame(self.container, 
                                 background=default_bg,
                                 borderwidth=2,  # 边框宽度
                                 relief="solid",  # 实线边框样式 
                                 highlightthickness=3,  # 外部高亮边框宽度
                                 highlightbackground="#d9d9d9",  # 浅灰色边框，与背景形成对比
                                 padx=0, pady=0)
        self.main_frame.pack(fill=tk.BOTH, expand=True, padx=0, pady=0)
        
        # Extract metadata from document
        self._extract_metadata()
        
        # Create image display area - 保持固定大小
        self.image_frame = tk.Frame(self.main_frame, width=width-10, height=height-10, background=default_bg)
        self.image_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        self.image_frame.pack_propagate(False)  # Prevent frame from shrinking
        
        self.image_label = ttk.Label(self.image_frame, text="Loading...")
        self.image_label.pack(fill=tk.BOTH, expand=True)
        
        # Create metadata display area
        self.meta_frame = tk.Frame(self.main_frame, background=default_bg)
        self.meta_frame.pack(fill=tk.X, padx=5, pady=2)
        
        # Create selection checkbox
        self.select_var = tk.BooleanVar(value=False)
        
        # 创建风格化的选择复选框
        style = ttk.Style()
        # 尝试配置复选框样式以使其更加明显
        style.configure("Bold.TCheckbutton", font=('TkDefaultFont', 10, 'bold'))
        
        self.select_checkbox = ttk.Checkbutton(self.meta_frame, 
                                             variable=self.select_var,
                                             style="Bold.TCheckbutton",
                                             command=self._on_checkbox_toggle)
        self.select_checkbox.pack(side=tk.LEFT)
        
        # Display filename or title
        name = self.metadata.get('filename', "Unnamed")
        self.name_label = ttk.Label(self.meta_frame, text=name, wraplength=width-40)
        self.name_label.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # 如果文件不存在，添加警告标记
        if self.doc.get('_file_missing'):
            warning_label = ttk.Label(self.meta_frame, text="⚠️", foreground="red", 
                                    font=("Arial", 12, "bold"))
            warning_label.pack(side=tk.RIGHT)
        
        # Add size info if available (move to a new line for layout)
        info_frame = tk.Frame(self.main_frame, background=default_bg)
        info_frame.pack(fill=tk.X, padx=5)
        
        if 'size' in self.metadata:
            size_kb = int(self.metadata['size'] / 1024) if isinstance(self.metadata['size'], (int, float)) else '?'
            size_text = f"Size: {size_kb} KB"
            size_label = ttk.Label(info_frame, text=size_text)
            size_label.pack(side=tk.LEFT, padx=(0, 10))
            
        # Add art movement if available
        if 'artMovement' in self.metadata:
            movement_label = ttk.Label(info_frame, text=f"Style: {self.metadata['artMovement']}")
            movement_label.pack(side=tk.LEFT)
        
        # Bind left-click to select this card
        self.bind("<Button-1>", self._on_click)
        self.image_label.bind("<Button-1>", self._on_click)
        self.name_label.bind("<Button-1>", self._on_click)
        self.main_frame.bind("<Button-1>", self._on_click)
        self.image_frame.bind("<Button-1>", self._on_click)
        self.meta_frame.bind("<Button-1>", self._on_click)
        info_frame.bind("<Button-1>", self._on_click)
    
    def _extract_metadata(self):
        """Extract metadata from document"""
        # 提取文档的元数据
        if not self.doc:
            return
            
        # Extract image path
        if 'filePath' in self.doc:
            self.image_path = self.doc['filePath']
            self.metadata['filepath'] = self.image_path
        elif 'imageUrl' in self.doc:
            self.image_path = self.doc['imageUrl']
            self.metadata['imageurl'] = self.image_path
                
        # Extract other metadata
        if 'filename' in self.doc:
            self.metadata['filename'] = self.doc['filename']
        elif 'title' in self.doc:
            self.metadata['filename'] = self.doc['title']
                
        if 'size' in self.doc:
            self.metadata['size'] = self.doc['size']
                
        if 'metadata' in self.doc and isinstance(self.doc['metadata'], dict):
            for key, value in self.doc['metadata'].items():
                self.metadata[key] = value
    
    def _on_click(self, event):
        """处理左键点击事件"""
        # 切换选中状态 - 选择框自己会触发_on_checkbox_toggle回调
        new_state = not self.select_var.get()
        self.select_var.set(new_state)
        # 直接调用更新视觉效果，以防回调机制失效
        self._on_checkbox_toggle()
        # 强制更新UI
        self.update_idletasks()
    
    def _on_checkbox_toggle(self):
        """处理复选框状态改变"""
        self.is_selected = self.select_var.get()
        
        if self.is_selected:
            # ====== 选中状态样式 ======
            # 使用高对比度的配色方案
            selected_bg = "#1E90FF"  # 道奇蓝，亮一些
            selected_border = "#0078D7"  # 微软蓝
            selected_text = "white"  # 白色文本
            
            # 主框架设置
            self.main_frame.configure(
                background=selected_bg,  # 背景为亮蓝色
                highlightbackground=selected_border,  # 边框为微软蓝
                highlightthickness=5,  # 加粗的边框
                borderwidth=3,  # 内边框也加粗
                relief="raised"  # 凸起效果增强立体感
            )
            
            # 所有子框架设置为相同的背景色，保持一致性
            for widget in self.main_frame.winfo_children():
                if isinstance(widget, tk.Frame):
                    widget.configure(background=selected_bg)  # 统一背景色
            
            # 直接设置已知的子框架
            if hasattr(self, 'image_frame'):
                self.image_frame.configure(background=selected_bg)
            if hasattr(self, 'meta_frame'):
                self.meta_frame.configure(background=selected_bg)
                
            # 所有标签文本改为白色，增强可读性
            # 遍历所有子框架查找标签
            for frame in self.main_frame.winfo_children():
                if isinstance(frame, tk.Frame):
                    for widget in frame.winfo_children():
                        if isinstance(widget, ttk.Label):
                            widget.configure(foreground=selected_text)
            
            # 确保文件名标签颜色也更改
            if hasattr(self, 'name_label'):
                self.name_label.configure(foreground=selected_text)
                
        else:
            # ====== 未选中状态样式 ======
            default_bg = "#f0f0f0"  # 标准灰色背景
            default_border = "#d9d9d9"  # 浅灰色边框
            default_text = "black"  # 黑色文本
            
            # 主框架恢复默认样式
            self.main_frame.configure(
                background=default_bg,
                highlightbackground=default_border,
                highlightthickness=3,
                borderwidth=2,
                relief="solid"
            )
            
            # 恢复所有子框架为默认背景色
            for widget in self.main_frame.winfo_children():
                if isinstance(widget, tk.Frame):
                    widget.configure(background=default_bg)
            
            # 直接设置已知的子框架
            if hasattr(self, 'image_frame'):
                self.image_frame.configure(background=default_bg)
            if hasattr(self, 'meta_frame'):
                self.meta_frame.configure(background=default_bg)
                
            # 恢复所有标签文本为黑色
            for frame in self.main_frame.winfo_children():
                if isinstance(frame, tk.Frame):
                    for widget in frame.winfo_children():
                        if isinstance(widget, ttk.Label):
                            widget.configure(foreground=default_text)
            
            # 确保文件名标签颜色也恢复
            if hasattr(self, 'name_label'):
                self.name_label.configure(foreground=default_text)
        
        # 调用回调函数通知父组件
        if self.on_select_callback:
            self.on_select_callback(self, self.is_selected)
            
        # 强制刷新UI
        self.update_idletasks()
    
    def set_selected(self, selected):
        """从外部设置选中状态"""
        if selected != self.is_selected:
            # 更新内部状态标记
            self.is_selected = selected
            # 更新UI变量
            self.select_var.set(selected)
            # 直接更新状态和视觉效果
            self._on_checkbox_toggle()
            # 强制UI更新
            self.update_idletasks()
    
    def load_image(self):
        """Load and display an image"""
        # 加载并显示图片
        if not self.image_path:
            self.image_label.config(text="No image available")
            return False
            
        try:
            # Handle relative paths for imageUrl
            path_to_try = self.image_path
            if self.image_path.startswith('/'):
                # Try to find in public directory
                proj_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                path_to_try = os.path.join(proj_dir, 'public', self.image_path.lstrip('/'))
            
            # Check if file exists
            if not os.path.exists(path_to_try):
                # 如果文件不存在，显示特殊图标表示问题
                self.image_label.config(text="⚠️ Image not found")
                return False
                
            # Open and process image
            image = Image.open(path_to_try)
            
            # Resize to fit in the frame, maintaining aspect ratio
            width, height = image.size
            ratio = min(self.width/width, self.height/height)
            new_width = int(width * ratio)
            new_height = int(height * ratio)
            
            image = image.resize((new_width, new_height), Image.LANCZOS)
            
            # Convert to Tkinter PhotoImage
            tk_image = ImageTk.PhotoImage(image)
            
            # Update label
            self.image_label.config(image=tk_image, text="")
            self.image_label.image = tk_image  # Keep a reference
            self.image = tk_image
            
            return True
            
        except Exception as e:
            self.image_label.config(text=f"Error: {str(e)}")
            return False
            
    def setup_context_menu(self, callback):
        """Set up right-click context menu"""
        # 设置右键菜单
        self.context_menu = Menu(self, tearoff=0)
        self.context_menu.add_command(label="View Details", 
                                    command=lambda: callback("view", self.doc))
        self.context_menu.add_command(label="Create Relationship", 
                                    command=lambda: callback("relate", self.doc))
        self.context_menu.add_command(label="Export", 
                                    command=lambda: callback("export", self.doc))
        self.context_menu.add_separator()
        self.context_menu.add_command(label="Delete", 
                                    command=lambda: callback("delete", self.doc))
        self.context_menu.add_separator()
        self.context_menu.add_command(label="Select/Unselect", 
                                    command=lambda: self.set_selected(not self.is_selected))
        
        # Bind right-click to show menu
        self.bind("<Button-3>", self._show_context_menu)
        self.image_label.bind("<Button-3>", self._show_context_menu)
        self.name_label.bind("<Button-3>", self._show_context_menu)
        
    def _show_context_menu(self, event):
        """Show context menu on right click"""
        try:
            self.context_menu.tk_popup(event.x_root, event.y_root)
        finally:
            self.context_menu.grab_release()

# ImageLoader类 - 与optimized_app.py相同
class ImageLoader:
    """Background image loader to improve performance"""
    def __init__(self, callback):
        self.queue = queue.Queue()
        self.callback = callback
        self.running = True
        self.thread = threading.Thread(target=self._process_queue, daemon=True)
        self.thread.start()
        
    def add_task(self, card):
        """Add a card to the loading queue"""
        self.queue.put(card)
        
    def _process_queue(self):
        """Process the loading queue"""
        while self.running:
            try:
                card = self.queue.get(timeout=0.5)
                success = card.load_image()
                
                # Notify main thread
                if self.callback:
                    self.callback(card, success)
                    
                self.queue.task_done()
                
            except queue.Empty:
                # No items in queue
                pass
            except Exception as e:
                print(f"Error loading image: {e}")
                
    def stop(self):
        """Stop the loader thread"""
        self.running = False
        if self.thread.is_alive():
            self.thread.join(1.0)

# PaginatedGrid类 - 与optimized_app.py中相同
class PaginatedGrid(ttk.Frame):
    """A paginated grid view for displaying large collections"""
    def __init__(self, parent, page_size=DEFAULT_PAGE_SIZE):
        super().__init__(parent)
        self.page_size = page_size
        self.current_page = 0
        self.items = []
        self.filtered_items = []  # 添加过滤后的项目列表
        self.search_query = ""  # 搜索查询
        self.card_width = 250
        self.card_height = 200
        self.columns = DEFAULT_GRID_COLUMNS
        self.context_callback = None
        
        # 存储当前显示的卡片和选中的卡片
        self.cards = []
        self.selected_cards = []
        
        # 视图模式：grid 或 list
        self.view_mode = "grid"  # 默认网格视图
        
        # 添加多选支持变量
        self.last_selected_index = -1  # 用于Shift多选
        self.selecting_with_shift = False  # 标记是否正在使用Shift进行多选
        self.selecting_with_ctrl = False  # 标记是否正在使用Ctrl进行多选
        self.is_mouse_selecting = False  # 用于鼠标框选
        self.start_x = 0
        self.start_y = 0
        self.selection_rectangle = None  # 存储框选的矩形对象
        
        self.image_loader = ImageLoader(self._on_image_loaded)
        
        self._create_ui()
        
        # 绑定键盘快捷键
        self._bind_keyboard_shortcuts()
    
    def _bind_keyboard_shortcuts(self):
        """绑定键盘快捷键"""
        # 绑定全局键盘状态跟踪
        self.winfo_toplevel().bind("<KeyPress-Control_L>", self._on_ctrl_key_press)
        self.winfo_toplevel().bind("<KeyRelease-Control_L>", self._on_ctrl_key_release)
        self.winfo_toplevel().bind("<KeyPress-Control_R>", self._on_ctrl_key_press)
        self.winfo_toplevel().bind("<KeyRelease-Control_R>", self._on_ctrl_key_release)
        self.winfo_toplevel().bind("<KeyPress-Shift_L>", self._on_shift_key_press)
        self.winfo_toplevel().bind("<KeyRelease-Shift_L>", self._on_shift_key_release)
        self.winfo_toplevel().bind("<KeyPress-Shift_R>", self._on_shift_key_press)
        self.winfo_toplevel().bind("<KeyRelease-Shift_R>", self._on_shift_key_release)
        
        # 全选、取消全选和反选快捷键
        self.winfo_toplevel().bind("<Control-a>", self._select_all_shortcut)  # Ctrl+A 全选
        self.winfo_toplevel().bind("<Control-A>", self._select_all_shortcut)  # 大写也支持
        self.winfo_toplevel().bind("<Control-d>", self._deselect_all_shortcut)  # Ctrl+D 取消全选
        self.winfo_toplevel().bind("<Control-D>", self._deselect_all_shortcut)  # 大写也支持
        self.winfo_toplevel().bind("<Control-i>", self._invert_selection_shortcut)  # Ctrl+I 反选
        self.winfo_toplevel().bind("<Control-I>", self._invert_selection_shortcut)  # 大写也支持
    
    def _on_ctrl_key_press(self, event):
        """Ctrl键按下事件"""
        self.selecting_with_ctrl = True
        
    def _on_ctrl_key_release(self, event):
        """Ctrl键释放事件"""
        self.selecting_with_ctrl = False
        
    def _on_shift_key_press(self, event):
        """Shift键按下事件"""
        self.selecting_with_shift = True
        
    def _on_shift_key_release(self, event):
        """Shift键释放事件"""
        self.selecting_with_shift = False

    def _select_all_shortcut(self, event):
        """处理Ctrl+A全选快捷键"""
        for card in self.cards:
            card.set_selected(True)
        self._update_selection_ui()
        return "break"  # 防止事件继续传播
    
    def _deselect_all_shortcut(self, event):
        """处理Ctrl+D取消全选快捷键"""
        for card in self.cards:
            card.set_selected(False)
        self._update_selection_ui()
        return "break"  # 防止事件继续传播
    
    def _invert_selection_shortcut(self, event):
        """处理Ctrl+I反选快捷键"""
        for card in self.cards:
            card.set_selected(not card.is_selected)
        self._update_selection_ui()
        return "break"  # 防止事件继续传播
    
    def _create_ui(self):
        # 添加搜索框
        self.search_frame = ttk.Frame(self)
        self.search_frame.pack(fill=tk.X, pady=(0, 5))
        
        ttk.Label(self.search_frame, text="搜索:").pack(side=tk.LEFT, padx=(0, 5))
        self.search_var = tk.StringVar()
        self.search_entry = ttk.Entry(self.search_frame, textvariable=self.search_var, width=30)
        self.search_entry.pack(side=tk.LEFT, padx=5)
        self.search_entry.bind("<Return>", self._on_search)
        
        ttk.Button(self.search_frame, text="查找", command=self._on_search).pack(side=tk.LEFT, padx=5)
        ttk.Button(self.search_frame, text="清除", command=self._clear_search).pack(side=tk.LEFT, padx=5)
        
        # 搜索结果标签
        self.search_result_var = tk.StringVar()
        ttk.Label(self.search_frame, textvariable=self.search_result_var).pack(side=tk.RIGHT, padx=10)
        
        # 工具栏
        self.toolbar_frame = ttk.Frame(self)
        self.toolbar_frame.pack(fill=tk.X, pady=(0, 5))
        
        # 全选复选框
        self.select_all_var = tk.BooleanVar(value=False)
        self.select_all_check = ttk.Checkbutton(self.toolbar_frame, text="全选/取消全选",
                                            variable=self.select_all_var,
                                            command=self._toggle_select_all)
        self.select_all_check.pack(side=tk.LEFT, padx=5)
        
        # 添加持续选择模式
        self.continuous_select_var = tk.BooleanVar(value=False)
        self.continuous_select_check = ttk.Checkbutton(self.toolbar_frame, text="持续选择模式",
                                               variable=self.continuous_select_var)
        self.continuous_select_check.pack(side=tk.LEFT, padx=5)
        
        # 批量操作按钮
        ttk.Button(self.toolbar_frame, text="批量导出", 
                command=self._bulk_export).pack(side=tk.LEFT, padx=5)
        ttk.Button(self.toolbar_frame, text="批量关联", 
                command=self._bulk_create_relation).pack(side=tk.LEFT, padx=5)
                
        # 视图切换按钮
        self.view_mode_var = tk.StringVar(value="grid")
        ttk.Radiobutton(self.toolbar_frame, text="网格视图", 
                        variable=self.view_mode_var, value="grid",
                        command=self._switch_view_mode).pack(side=tk.LEFT, padx=(20,5))
        ttk.Radiobutton(self.toolbar_frame, text="列表视图", 
                        variable=self.view_mode_var, value="list",
                        command=self._switch_view_mode).pack(side=tk.LEFT, padx=5)
        
        # 添加快捷键提示
        shortcuts_text = "快捷键: Ctrl+A(全选) Ctrl+D(取消全选) Ctrl+I(反选) Shift(连续选择) Ctrl(多选) 鼠标拖动(框选)"
        ttk.Label(self.toolbar_frame, text=shortcuts_text, 
                 font=("Arial", 8), foreground="#555555").pack(side=tk.LEFT, padx=10)
        
        # 显示选择数量
        self.selection_count_var = tk.StringVar(value="已选择: 0项")
        self.selection_count_label = ttk.Label(self.toolbar_frame, textvariable=self.selection_count_var)
        self.selection_count_label.pack(side=tk.RIGHT, padx=10)
        
        # 创建Canvas和Scrollbar - 用于网格视图
        self.grid_container = ttk.Frame(self)
        self.grid_container.pack(fill=tk.BOTH, expand=True)
        
        # 创建Canvas和Scrollbar
        self.outer_frame = ttk.Frame(self.grid_container)
        self.outer_frame.pack(fill=tk.BOTH, expand=True)
        
        self.canvas = tk.Canvas(self.outer_frame, highlightthickness=0)
        self.scrollbar = ttk.Scrollbar(self.outer_frame, orient=tk.VERTICAL, command=self.canvas.yview)
        self.canvas.configure(yscrollcommand=self.scrollbar.set)
        
        self.scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # 创建内部Frame
        self.grid_frame = ttk.Frame(self.canvas)
        self.canvas_window = self.canvas.create_window((0, 0), window=self.grid_frame, anchor='nw')
        
        # 设置Canvas以支持鼠标拖动框选
        self.canvas.bind("<ButtonPress-1>", self._on_mouse_down)
        self.canvas.bind("<B1-Motion>", self._on_mouse_drag)
        self.canvas.bind("<ButtonRelease-1>", self._on_mouse_release)
        
        # 创建列表视图容器 - 初始隐藏
        self.list_container = ttk.Frame(self)
        
        # 创建Treeview用于列表视图
        self.list_tree = ttk.Treeview(self.list_container, columns=("name", "type", "size", "path"), show="headings")
        self.list_tree.heading("name", text="名称")
        self.list_tree.heading("type", text="类型")
        self.list_tree.heading("size", text="大小")
        self.list_tree.heading("path", text="路径")
        
        self.list_tree.column("name", width=200)
        self.list_tree.column("type", width=100)
        self.list_tree.column("size", width=100)
        self.list_tree.column("path", width=300)
        
        # 给列表添加滚动条
        list_scrollbar = ttk.Scrollbar(self.list_container, orient=tk.VERTICAL, command=self.list_tree.yview)
        self.list_tree.configure(yscrollcommand=list_scrollbar.set)
        
        list_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.list_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # 绑定列表视图的选择事件
        self.list_tree.bind("<ButtonPress-1>", self._on_list_click)
        self.list_tree.bind("<<TreeviewSelect>>", self._on_list_selection_changed)
        
        # 分页控件
        self.pagination_frame = ttk.Frame(self)
        self.pagination_frame.pack(fill=tk.X, pady=5)
        
        self.prev_button = ttk.Button(self.pagination_frame, text="< Prev", command=self.prev_page)
        self.prev_button.pack(side=tk.LEFT, padx=5)
        
        self.page_label = ttk.Label(self.pagination_frame, text="Page 1 of 1")
        self.page_label.pack(side=tk.LEFT, padx=10)
        
        self.next_button = ttk.Button(self.pagination_frame, text="Next >", command=self.next_page)
        self.next_button.pack(side=tk.LEFT, padx=5)
        
        # 每页显示数量控件
        ttk.Label(self.pagination_frame, text="Items per page:").pack(side=tk.LEFT, padx=(20, 5))
        
        self.page_size_var = tk.StringVar(value=str(self.page_size))
        self.page_size_combo = ttk.Combobox(self.pagination_frame, textvariable=self.page_size_var,
                                        values=["12", "24", "36", "48", "72"], width=5)
        self.page_size_combo.pack(side=tk.LEFT, padx=5)
        self.page_size_combo.bind("<<ComboboxSelected>>", self._on_page_size_changed)
        
        # 为Canvas配置事件
        self.grid_frame.bind("<Configure>", self._on_frame_configure)
        self.canvas.bind("<Configure>", self._on_canvas_configure)
        
        # Set mouse wheel binding
        self.bind_mousewheel()
        
        # 更新界面状态
        self._update_selection_ui()
        
    def _switch_view_mode(self):
        """切换视图模式"""
        mode = self.view_mode_var.get()
        if mode == "grid" and self.view_mode != "grid":
            # 切换到网格视图之前先解绑列表视图的鼠标滚轮事件
            self.canvas.unbind_all("<MouseWheel>")
            
            # 切换到网格视图
            self.view_mode = "grid"
            self.list_container.pack_forget()
            self.grid_container.pack(fill=tk.BOTH, expand=True)
            
            # 重新绑定网格视图的鼠标滚轮事件
            self.bind_mousewheel()
            
            # 刷新网格视图 - 使用try-except防止出错时界面卡死
            try:
                self.refresh_grid()
            except Exception as e:
                print(f"刷新网格视图出错: {e}")
                messagebox.showerror("视图刷新错误", f"刷新网格视图时出错: {e}")
                
        elif mode == "list" and self.view_mode != "list":
            # 切换到列表视图之前先解绑网格视图的鼠标滚轮事件
            self.unbind_mousewheel()
            
            # 切换到列表视图
            self.view_mode = "list"
            self.grid_container.pack_forget()
            self.list_container.pack(fill=tk.BOTH, expand=True)
            
            # 刷新列表视图 - 使用try-except防止出错时界面卡死
            try:
                self.refresh_list()
            except Exception as e:
                print(f"刷新列表视图出错: {e}")
                messagebox.showerror("视图刷新错误", f"刷新列表视图时出错: {e}")
                
    def _on_list_selection_changed(self, event):
        """处理列表视图选择变化事件"""
        # 防止无限循环
        if hasattr(self, '_list_updating') and self._list_updating:
            return
            
        self._list_updating = True
        try:
            # 获取所有选中的列表项
            selected_items = self.list_tree.selection()
            
            # 清除当前卡片选择
            for card in self.cards:
                card.set_selected(False)
            self.selected_cards = []
            
            # 为每个选中的列表项找到对应的卡片并选中
            selected_docs = []
            for item_id, doc in self.list_items:
                if item_id in selected_items:
                    selected_docs.append(doc)
                    
            # 只遍历一次卡片列表，提高效率
            for card in self.cards:
                if card.doc in selected_docs:
                    card.set_selected(True)
                    self.selected_cards.append(card)
            
            # 更新UI
            self._update_selection_ui()
        finally:
            # 确保标志被清除
            self._list_updating = False
    
    def _sync_list_selection(self):
        """同步选中状态到列表视图"""
        # 防止无限循环
        if hasattr(self, '_list_updating') and self._list_updating:
            return
            
        self._list_updating = True
        try:
            # 清除现有选择
            self.list_tree.selection_remove(self.list_tree.selection())
            
            # 如果有选中的卡片，找到对应的列表项并选中
            if self.selected_cards:
                selected_docs = [card.doc for card in self.selected_cards]
                
                for item_id, doc in self.list_items:
                    if doc in selected_docs:
                        self.list_tree.selection_add(item_id)
        finally:
            # 确保标志被清除
            self._list_updating = False
    
    def _on_list_click(self, event):
        """处理列表视图的点击事件，支持Shift和Ctrl多选以及持续选择模式"""
        # 防止无限循环
        if hasattr(self, '_list_updating') and self._list_updating:
            return
            
        # 获取点击的项
        item = self.list_tree.identify_row(event.y)
        if not item:
            return
            
        # 检查是否按下了控制键或者启用了持续选择模式
        if self.selecting_with_ctrl or self.continuous_select_var.get():
            # Ctrl+点击或持续选择模式：切换选中状态
            if item in self.list_tree.selection():
                self.list_tree.selection_remove(item)
            else:
                self.list_tree.selection_add(item)
            return "break"  # 阻止默认行为
            
        if self.selecting_with_shift and self.list_tree.selection():
            # Shift+点击：选择范围
            last_selected = self.list_tree.selection()[-1]  # 最后选中的项
            all_items = self.list_tree.get_children()
            
            # 计算范围
            try:
                current_idx = all_items.index(item)
                last_idx = all_items.index(last_selected)
                
                # 决定范围的开始和结束
                start_idx = min(current_idx, last_idx)
                end_idx = max(current_idx, last_idx)
                
                # 选择范围内的所有项
                for i in range(start_idx, end_idx + 1):
                    self.list_tree.selection_add(all_items[i])
                
                return "break"  # 阻止默认行为
            except ValueError:
                pass  # 项不在列表中，忽略
        
        # 默认行为：如果没有按修饰键也没有启用持续选择模式，清除现有选择并选中当前项
        if not (self.selecting_with_ctrl or self.selecting_with_shift or self.continuous_select_var.get()):
            self.list_tree.selection_set(item)
    
    def refresh_list(self):
        """刷新列表视图"""
        # 清空现有内容
        for item in self.list_tree.get_children():
            self.list_tree.delete(item)
            
        if not self.filtered_items:
            return
            
        # 计算分页
        total_pages = max(1, math.ceil(len(self.filtered_items) / self.page_size))
        if self.current_page >= total_pages:
            self.current_page = total_pages - 1
            
        # 获取当前页的项目
        start_idx = self.current_page * self.page_size
        end_idx = min(start_idx + self.page_size, len(self.filtered_items))
        current_items = self.filtered_items[start_idx:end_idx]
        
        # 将数据添加到列表中
        self.list_items = []  # 用于跟踪列表项和文档的对应关系
        
        for item in current_items:
            # 提取显示信息
            doc_id = str(item.get('_id', ''))
            name = item.get('title', item.get('filename', doc_id))
            doc_type = item.get('type', item.get('artMovement', ''))
            size = f"{int(item.get('size', 0) / 1024)} KB" if 'size' in item else ''
            path = item.get('filePath', item.get('imageUrl', ''))
            
            # 插入到树形视图
            item_id = self.list_tree.insert('', tk.END, values=(name, doc_type, size, path))
            
            # 存储列表项ID与文档的映射关系
            self.list_items.append((item_id, item))
                
        # 更新分页控件
        self._update_pagination_controls()
        
        # 根据选中的卡片选中对应的列表项
        self._sync_list_selection()
    
    def refresh_grid(self):
        """别名，向后兼容，调用refresh_list"""
        # 清除现有网格内容
        for widget in self.grid_frame.winfo_children():
            widget.destroy()
            
        # 清空卡片列表
        self.cards = []
            
        if not self.filtered_items:  # 使用过滤后的列表
            # No items to display
            no_items_label = ttk.Label(self.grid_frame, text="No items to display")
            no_items_label.pack(pady=50)
            self._update_pagination_controls()
            self._update_selection_ui()
            return
            
        # Calculate pagination
        total_pages = max(1, math.ceil(len(self.filtered_items) / self.page_size))
        if self.current_page >= total_pages:
            self.current_page = total_pages - 1
            
        # Get current page items
        start_idx = self.current_page * self.page_size
        end_idx = min(start_idx + self.page_size, len(self.filtered_items))
        current_items = self.filtered_items[start_idx:end_idx]  # 使用过滤后的列表
        
        # Create grid
        row = 0
        col = 0
        
        for item in current_items:
            # Create frame for this item
            card = ImageCard(self.grid_frame, doc=item, 
                           width=self.card_width, height=self.card_height,
                           on_select_callback=self._on_card_selected)
                           
            # Position in grid
            card.grid(row=row, column=col, padx=5, pady=5, sticky="nsew")
            
            # Set up context menu if callback provided
            if self.context_callback:
                card.setup_context_menu(self.context_callback)
                
            # Add to image loader queue
            self.image_loader.add_task(card)
            
            # 保存卡片引用
            self.cards.append(card)
            
            # Update position
            col += 1
            if col >= self.columns:
                col = 0
                row += 1
                
        # Configure grid weights
        for i in range(self.columns):
            self.grid_frame.columnconfigure(i, weight=1)
            
        # Update pagination controls
        self._update_pagination_controls()
        
        # 更新选择UI
        self._update_selection_ui()
    
    def _on_card_selected(self, card, is_selected):
        """处理卡片选择事件，支持Shift和Ctrl多选以及持续选择模式"""
        current_index = self.cards.index(card) if card in self.cards else -1
        
        # 1. 如果开启了持续选择模式，则不清除现有选择
        # 2. 或者如果按下了Ctrl或Shift键，也不清除现有选择
        if not (self.continuous_select_var.get() or self.selecting_with_ctrl or self.selecting_with_shift) and is_selected and len(self.selected_cards) > 0:
            # 清除除当前卡片外的所有选择
            for other_card in self.selected_cards[:]:
                if other_card != card:
                    other_card.set_selected(False)
            self.selected_cards = []
        
        if is_selected:
            # 添加到选择列表
            if card not in self.selected_cards:
                self.selected_cards.append(card)
                
            # 如果按住Shift键并且有上一次选择的卡片
            if self.selecting_with_shift and self.last_selected_index >= 0 and current_index >= 0:
                # 计算范围
                start_idx = min(self.last_selected_index, current_index)
                end_idx = max(self.last_selected_index, current_index)
                
                # 选择范围内的所有卡片
                for i in range(start_idx, end_idx + 1):
                    if i < len(self.cards):
                        range_card = self.cards[i]
                        if range_card not in self.selected_cards:
                            range_card.set_selected(True)
        else:
            # 从选择列表中移除
            if card in self.selected_cards:
                self.selected_cards.remove(card)
                
        # 如果不是使用Shift键进行连续选择，则更新最后选择的索引
        if not self.selecting_with_shift:
            if current_index >= 0:
                self.last_selected_index = current_index
                
        # 更新UI显示
        self._update_selection_ui()
        
        # 同步到列表视图(如果当前是列表视图)
        if self.view_mode == "list":
            self._sync_list_selection()
    
    def _on_frame_configure(self, event):
        """Update scrollregion when the frame changes size"""
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        
    def _on_canvas_configure(self, event):
        """Resize the frame inside canvas when canvas is resized"""
        width = event.width
        self.canvas.itemconfig(self.canvas_window, width=width)
        
    def _on_mousewheel(self, event):
        """Handle mouse wheel scrolling"""
        self.canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
        
    def bind_mousewheel(self):
        """Bind mouse wheel event to canvas"""
        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)
        
    def unbind_mousewheel(self):
        """Unbind mouse wheel event"""
        self.canvas.unbind_all("<MouseWheel>")
        
    def set_context_menu_callback(self, callback):
        """Set callback for context menu actions"""
        self.context_callback = callback
        
    def set_items(self, items):
        """Set the items to display in the grid"""
        self.items = items
        self.filtered_items = items  # 重置过滤结果
        self.search_query = ""  # 重置搜索查询
        self.search_var.set("")  # 清空搜索框
        self.search_result_var.set("")  # 清空结果信息
        self.current_page = 0
        # 清空选中记录
        self.selected_cards = []
        self.select_all_var.set(False)
        
        # 根据当前视图模式刷新显示
        if self.view_mode == "grid":
            self.refresh_grid()
        else:
            self.refresh_list()
            
    def set_columns(self, columns):
        """Set the number of columns in the grid"""
        self.columns = columns
    
    def _on_image_loaded(self, card, success):
        """Callback when an image is loaded"""
        # This method is called by the ImageLoader when an image finishes loading
        pass
        
    def destroy(self):
        """Clean up resources before destroying widget"""
        if hasattr(self, 'image_loader'):
            self.image_loader.stop()
        super().destroy()

    def _on_search(self, event=None):
        """处理搜索操作"""
        query = self.search_var.get().lower().strip()
        if query == self.search_query:
            return  # 搜索条件未变，不执行搜索
            
        self.search_query = query
        
        if not query:
            # 空查询，恢复所有项目
            self.filtered_items = self.items
            self.search_result_var.set("")
        else:
            # 执行搜索
            self.filtered_items = self._filter_items(query)
            result_count = len(self.filtered_items)
            self.search_result_var.set(f"找到 {result_count} 项结果")
            
        # 重置页码并刷新显示
        self.current_page = 0
        self.selected_cards = []
        self.select_all_var.set(False)
        
        # 根据当前视图模式刷新显示
        if self.view_mode == "grid":
            self.refresh_grid()
        else:
            self.refresh_list()
    
    def _clear_search(self):
        """清除搜索结果"""
        self.search_var.set("")
        self.search_query = ""
        self.filtered_items = self.items
        self.search_result_var.set("")
        
        # 重置页码并刷新显示
        self.current_page = 0
        self.selected_cards = []
        self.select_all_var.set(False)
        
        # 根据当前视图模式刷新显示
        if self.view_mode == "grid":
            self.refresh_grid()
        else:
            self.refresh_list()
    
    def _filter_items(self, query):
        """根据查询过滤项目"""
        filtered = []
        
        for item in self.items:
            # 搜索的关键字段
            search_fields = [
                item.get('filename', ''),
                item.get('title', ''),
                str(item.get('_id', '')),
                item.get('artMovement', ''),
                item.get('description', '')
            ]
            
            # 扩展搜索 - 检查metadata字段
            if 'metadata' in item and isinstance(item['metadata'], dict):
                for key, value in item['metadata'].items():
                    search_fields.append(str(value))
            
            # 任何字段匹配即可
            for field in search_fields:
                if query in str(field).lower():
                    filtered.append(item)
                    break
                    
        return filtered
    
    def _on_mouse_down(self, event):
        """处理鼠标按下事件，开始选择过程"""
        # 检查是否点击在空白区域
        widget = event.widget.winfo_containing(event.x_root, event.y_root)
        if widget == self.canvas:
            # 如果不是按住Ctrl键，则清除之前的选择
            if not self.selecting_with_ctrl:
                for card in self.selected_cards:
                    card.set_selected(False)
                self.selected_cards = []
                
            # 记录开始选择的位置
            self.is_mouse_selecting = True
            self.start_x = self.canvas.canvasx(event.x)
            self.start_y = self.canvas.canvasy(event.y) + self.canvas.yview()[0] * self.canvas.winfo_height()
            
            # 创建选择矩形
            self.selection_rectangle = self.canvas.create_rectangle(
                self.start_x, self.start_y, self.start_x, self.start_y,
                outline='#0078D7', width=2, dash=(4, 4)
            )
    
    def _on_mouse_drag(self, event):
        """处理鼠标拖动事件，更新选择矩形"""
        if self.is_mouse_selecting and self.selection_rectangle:
            # 获取当前位置，考虑滚动位置
            current_x = self.canvas.canvasx(event.x)
            current_y = self.canvas.canvasy(event.y) + self.canvas.yview()[0] * self.canvas.winfo_height()
            
            # 更新选择矩形
            self.canvas.coords(self.selection_rectangle, 
                              self.start_x, self.start_y, current_x, current_y)
            
            # 实时选择被框选的卡片
            self._select_cards_in_rectangle(self.start_x, self.start_y, current_x, current_y)
    
    def _on_mouse_release(self, event):
        """处理鼠标释放事件，完成选择过程"""
        if self.is_mouse_selecting:
            # 获取最终位置
            end_x = self.canvas.canvasx(event.x)
            end_y = self.canvas.canvasy(event.y) + self.canvas.yview()[0] * self.canvas.winfo_height()
            
            # 最终选择框选的卡片
            self._select_cards_in_rectangle(self.start_x, self.start_y, end_x, end_y)
            
            # 删除选择矩形
            if self.selection_rectangle:
                self.canvas.delete(self.selection_rectangle)
                self.selection_rectangle = None
            
            # 重置选择状态
            self.is_mouse_selecting = False
    
    def _select_cards_in_rectangle(self, x1, y1, x2, y2):
        """选择矩形区域内的所有卡片"""
        # 确保矩形坐标正确（左上角到右下角）
        left = min(x1, x2)
        top = min(y1, y2)
        right = max(x1, x2)
        bottom = max(y1, y2)
        
        # 检查每个卡片是否在选择矩形内
        for i, card in enumerate(self.cards):
            card_widget = card.main_frame
            if not card_widget.winfo_ismapped():
                continue  # 跳过未显示的卡片
                
            # 获取卡片在Canvas中的位置和大小
            # 这里的关键是正确计算卡片的绝对位置，考虑画布的滚动
            bbox = self.canvas.bbox(self.canvas_window)
            if not bbox:
                continue
                
            card_x = card_widget.winfo_x() + bbox[0]
            card_y = card_widget.winfo_y() + bbox[1]
            width = card_widget.winfo_width()
            height = card_widget.winfo_height()
            
            # 卡片的边界
            card_left = card_x
            card_top = card_y
            card_right = card_x + width
            card_bottom = card_y + height
            
            # 检查卡片是否与选择矩形相交
            if (card_right >= left and card_left <= right and
                card_bottom >= top and card_top <= bottom):
                # 如果卡片不在选中列表中，添加它
                if card not in self.selected_cards:
                    card.set_selected(True)
            elif not self.selecting_with_ctrl:  # 如果不是按住Ctrl键
                # 如果卡片在选中列表中但不在矩形内，取消选中
                if card in self.selected_cards:
                    card.set_selected(False)
        
        # 更新选择UI
        self._update_selection_ui()
        
        # 同步到列表视图(如果当前是列表视图)
        if self.view_mode == "list":
            self._sync_list_selection()
    
    def _update_selection_ui(self):
        """更新选择相关的UI状态"""
        # 更新计数
        count = len(self.selected_cards)
        self.selection_count_var.set(f"已选择: {count}项")
        
        # 查找批量操作按钮并更新状态
        for widget in self.toolbar_frame.winfo_children():
            if isinstance(widget, ttk.Button):
                if widget["text"] in ["批量导出", "批量关联"]:
                    if count > 0:
                        widget.configure(state=tk.NORMAL)
                    else:
                        widget.configure(state=tk.DISABLED)
        
        # 更新全选框状态
        if count == 0:
            self.select_all_var.set(False)
        elif count == len(self.cards) and len(self.cards) > 0:
            self.select_all_var.set(True)
    
    def _toggle_select_all(self):
        """切换全选/取消全选状态"""
        select_all = self.select_all_var.get()
        
        # 更新所有卡片的选择状态
        for card in self.cards:
            card.set_selected(select_all)
            
        # 直接更新选中列表
        if select_all:
            self.selected_cards = list(self.cards)
        else:
            self.selected_cards = []
            
        # 更新UI
        self._update_selection_ui()
    
    def _bulk_export(self):
        """批量导出选中的文件"""
        if not self.selected_cards or not self.context_callback:
            return
            
        docs = [card.doc for card in self.selected_cards]
        self.context_callback("bulk_export", docs)
    
    def _bulk_create_relation(self):
        """批量创建关系"""
        if not self.selected_cards or not self.context_callback:
            return
            
        docs = [card.doc for card in self.selected_cards]
        self.context_callback("bulk_relate", docs)
        
    def next_page(self):
        """Go to next page"""
        total_pages = math.ceil(len(self.filtered_items) / self.page_size)  # 使用过滤后的列表
        if self.current_page < total_pages - 1:
            self.current_page += 1
            # 清空选中列表，因为页面变了
            self.selected_cards = []
            self.select_all_var.set(False)
            # 根据当前视图模式刷新显示
            if self.view_mode == "grid":
                self.refresh_grid()
            else:
                self.refresh_list()
            
    def prev_page(self):
        """Go to previous page"""
        if self.current_page > 0:
            self.current_page -= 1
            # 清空选中列表，因为页面变了
            self.selected_cards = []
            self.select_all_var.set(False)
            # 根据当前视图模式刷新显示
            if self.view_mode == "grid":
                self.refresh_grid()
            else:
                self.refresh_list()
                
    def _update_pagination_controls(self):
        """Update pagination controls state"""
        total_pages = max(1, math.ceil(len(self.filtered_items) / self.page_size))  # 使用过滤后的列表
        
        # Update page label
        if self.filtered_items:
            self.page_label.config(text=f"Page {self.current_page + 1} of {total_pages}")
        else:
            self.page_label.config(text="No items")
            
        # Update buttons state
        self.prev_button.config(state=tk.NORMAL if self.current_page > 0 else tk.DISABLED)
        self.next_button.config(state=tk.NORMAL if self.current_page < total_pages - 1 else tk.DISABLED)
        
    def _on_page_size_changed(self, event):
        """Handle page size combo selection"""
        try:
            new_size = int(self.page_size_var.get())
            if new_size != self.page_size:
                self.page_size = new_size
                # Reset to first page and refresh
                self.current_page = 0
                # 清空选中列表，因为页面变了
                self.selected_cards = []
                self.select_all_var.set(False)
                # 根据当前视图模式刷新显示
                if self.view_mode == "grid":
                    self.refresh_grid()
                else:
                    self.refresh_list()
        except ValueError:
            pass
            
    def _on_frame_configure(self, event):
        """Update scrollregion when the frame changes size"""
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        
    def _on_canvas_configure(self, event):
        """Resize the frame inside canvas when canvas is resized"""
        width = event.width
        self.canvas.itemconfig(self.canvas_window, width=width)
        
    def handle_context_menu(self, action, doc):
        """处理上下文菜单操作"""
        if action == "view":
            self.show_document_details(doc)
        elif action == "relate":
            self.create_relationship(doc)
        elif action == "export":
            self.export_document(doc)
        elif action == "delete":
            self.delete_document(doc)
        elif action == "bulk_export":
            # 批量导出
            self.bulk_export_documents(doc)  # 这里传入的doc实际上是文档列表
        elif action == "bulk_relate":
            # 批量创建关系
            self.bulk_create_relationships(doc)  # 这里传入的doc实际上是文档列表
    
    def show_document_details(self, doc):
        """显示文档详细信息"""
        # 显示格式化的JSON
        json_str = json.dumps(self.bson_to_json(doc), indent=2)
        self.json_text.delete(1.0, tk.END)
        self.json_text.insert(tk.END, json_str)
    
    def create_relationship(self, doc):
        """创建关系对话框"""
        # 创建一个新窗口
        rel_window = tk.Toplevel(self)
        rel_window.title("Create Relationship")
        rel_window.geometry("800x600")
        rel_window.grab_set()  # 模态窗口
        
        # 创建关系管理器
        rel_manager = RelationshipManager(rel_window, self.db_client, doc)
        rel_manager.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
    
    def export_document(self, doc):
        """导出文档到JSON文件"""
        if not doc:
            return
            
        # 获取保存文件路径
        default_name = f"{self.current_collection}_{str(doc.get('_id', 'doc'))}.json"
        file_path = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")],
            initialfile=default_name
        )
        
        if not file_path:
            return
            
        try:
            # 将文档导出为JSON
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(self.bson_to_json(doc), f, indent=2, ensure_ascii=False)
                
            messagebox.showinfo("Export", f"Document exported to {file_path}")
            
        except Exception as e:
            messagebox.showerror("Export Error", f"Failed to export document: {str(e)}")
    
    def bson_to_json(self, doc):
        """将BSON文档转换为JSON可序列化格式"""
        json_doc = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                json_doc[key] = str(value)
            elif isinstance(value, datetime.datetime):  # 处理datetime类型
                json_doc[key] = value.isoformat()
            elif isinstance(value, dict):
                json_doc[key] = self.bson_to_json(value)
            elif isinstance(value, list):
                json_doc[key] = [
                    self.bson_to_json(item) if isinstance(item, dict) else (
                        item.isoformat() if isinstance(item, datetime.datetime) else item
                    ) for item in value
                ]
            else:
                json_doc[key] = value
                
        return json_doc
    
    def bulk_export_documents(self, docs):
        """批量导出多个文档到JSON文件"""
        if not docs:
            return
        
        # 首先让用户选择一个目录
        export_dir = filedialog.askdirectory(
            title="选择导出目录"
        )
        
        if not export_dir:
            return
        
        try:
            # 跟踪成功和失败的数量
            success_count = 0
            fail_count = 0
            
            for doc in docs:
                try:
                    # 生成文件名
                    filename = f"{self.current_collection}_{str(doc.get('_id', 'doc'))}.json"
                    file_path = os.path.join(export_dir, filename)
                    
                    # 导出为JSON
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(self.bson_to_json(doc), f, indent=2, ensure_ascii=False)
                        
                    success_count += 1
                except Exception as e:
                    print(f"Error exporting {doc.get('_id')}: {e}")
                    fail_count += 1
                    
            # 显示结果
            if success_count > 0:
                messagebox.showinfo("批量导出", f"成功导出 {success_count} 个文件到 {export_dir}\n失败: {fail_count}")
            else:
                messagebox.showerror("批量导出", f"导出失败。\n失败: {fail_count}")
                
        except Exception as e:
            messagebox.showerror("批量导出错误", f"导出过程发生错误: {str(e)}")
    
    def bulk_create_relationships(self, docs):
        """批量创建关系"""
        if not docs or len(docs) == 0:
            return
        
        # 创建一个新窗口
        bulk_rel_window = tk.Toplevel(self)
        bulk_rel_window.title("批量创建关系")
        bulk_rel_window.geometry("800x600")
        bulk_rel_window.grab_set()  # 模态窗口
        
        # 创建界面
        frame = ttk.Frame(bulk_rel_window, padding=10)
        frame.pack(fill=tk.BOTH, expand=True)
        
        # 显示选中的文档数
        ttk.Label(frame, text=f"已选择 {len(docs)} 个文档作为源", font=('Arial', 12, 'bold')).pack(anchor=tk.W, pady=(0, 10))
        
        # 关系类型选择
        ttk.Label(frame, text="选择关系类型:").pack(anchor=tk.W)
        rel_type_var = tk.StringVar()
        rel_type_combo = ttk.Combobox(frame, textvariable=rel_type_var, values=RELATIONSHIP_TYPES)
        rel_type_combo.pack(fill=tk.X, pady=5)
        
        # 目标选择部分
        target_frame = ttk.LabelFrame(frame, text="选择目标文档")
        target_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # 数据库选择
        db_frame = ttk.Frame(target_frame)
        db_frame.pack(fill=tk.X, pady=5)
        ttk.Label(db_frame, text="数据库:").pack(side=tk.LEFT)
        db_var = tk.StringVar()
        db_combo = ttk.Combobox(db_frame, textvariable=db_var)
        db_combo.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        
        # 集合选择
        coll_frame = ttk.Frame(target_frame)
        coll_frame.pack(fill=tk.X, pady=5)
        ttk.Label(coll_frame, text="集合:").pack(side=tk.LEFT)
        coll_var = tk.StringVar()
        coll_combo = ttk.Combobox(coll_frame, textvariable=coll_var)
        coll_combo.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        
        # 文档列表
        doc_frame = ttk.Frame(target_frame)
        doc_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        ttk.Label(doc_frame, text="选择目标文档:").pack(anchor=tk.W)
        
        # 目标文档列表框
        list_frame = ttk.Frame(doc_frame)
        list_frame.pack(fill=tk.BOTH, expand=True)
        
        target_listbox = tk.Listbox(list_frame, selectmode=tk.SINGLE)
        target_scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=target_listbox.yview)
        target_listbox.config(yscrollcommand=target_scrollbar.set)
        
        target_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        target_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # 保存加载的文档
        target_docs = []
        
        # 操作按钮
        btn_frame = ttk.Frame(frame)
        btn_frame.pack(fill=tk.X, pady=10)
        
        ttk.Button(btn_frame, text="取消", command=bulk_rel_window.destroy).pack(side=tk.RIGHT, padx=5)
        create_btn = ttk.Button(btn_frame, text="创建关系", 
                             command=lambda: create_relationships())
        create_btn.pack(side=tk.RIGHT, padx=5)
        
        # 状态显示
        status_var = tk.StringVar(value="请选择关系类型和目标文档")
        status_label = ttk.Label(frame, textvariable=status_var, foreground="gray")
        status_label.pack(side=tk.BOTTOM, fill=tk.X)
        
        # 填充数据库列表
        def populate_db_list():
            try:
                db_list = self.db_client.list_database_names()
                # 过滤系统数据库
                db_list = [db for db in db_list if db not in ['admin', 'local', 'config']]
                db_combo['values'] = db_list
                if db_list:
                    db_combo.current(0)
                    on_db_selected()
            except Exception as e:
                status_var.set(f"获取数据库列表失败: {e}")
        
        # 处理数据库选择
        def on_db_selected(*args):
            selected_db = db_var.get()
            try:
                if selected_db:
                    collections = self.db_client[selected_db].list_collection_names()
                    coll_combo['values'] = collections
                    if collections:
                        coll_combo.current(0)
                        on_collection_selected()
                    else:
                        coll_combo.set("")
                        target_listbox.delete(0, tk.END)
                        target_docs.clear()
            except Exception as e:
                status_var.set(f"获取集合列表失败: {e}")
        
        # 处理集合选择
        def on_collection_selected(*args):
            selected_db = db_var.get()
            selected_coll = coll_var.get()
            
            target_listbox.delete(0, tk.END)
            target_docs.clear()
            
            if not selected_db or not selected_coll:
                return
            
            try:
                collection = self.db_client[selected_db][selected_coll]
                # 限制加载的文档数量
                found_docs = list(collection.find().limit(100))
                target_docs.extend(found_docs)
                
                # 填充列表框
                for doc in found_docs:
                    display_name = doc.get('title', doc.get('name', doc.get('filename', str(doc.get('_id')))))
                    target_listbox.insert(tk.END, display_name)
                    
                status_var.set(f"加载了 {len(found_docs)} 个文档")
            except Exception as e:
                status_var.set(f"加载文档失败: {e}")
        
        # 创建关系
        def create_relationships():
            selected_rel_type = rel_type_var.get()
            if not selected_rel_type:
                messagebox.showwarning("缺少关系类型", "请选择一个关系类型")
                return
            
            selection = target_listbox.curselection()
            if not selection:
                messagebox.showwarning("未选择目标", "请选择一个目标文档")
                return
            
            index = selection[0]
            target_doc = target_docs[index]
            
            selected_db = db_var.get()
            selected_coll = coll_var.get()
            
            # 创建关系数据库如果不存在
            relationships_db = self.db_client.get_database('relationships')
            rel_collection = relationships_db['art_relationships']
            
            # 跟踪成功和失败的数量
            success_count = 0
            fail_count = 0
            already_exists = 0
            
            for source_doc in docs:
                try:
                    source_id = source_doc.get('_id')
                    target_id = target_doc.get('_id')
                    
                    if not source_id or not target_id:
                        fail_count += 1
                        continue
                    
                    # 检查是否已存在相同的关系
                    existing = rel_collection.find_one({
                        'sourceId': source_id,
                        'targetId': target_id,
                        'type': selected_rel_type
                    })
                    
                    if existing:
                        already_exists += 1
                        continue
                    
                    # 创建关系文档
                    relationship = {
                        'sourceId': source_id,
                        'sourceCollection': self.current_collection,
                        'targetId': target_id,
                        'targetCollection': selected_coll,
                        'type': selected_rel_type,
                        'created': time.time()
                    }
                    
                    # 插入关系
                    result = rel_collection.insert_one(relationship)
                    
                    if result.inserted_id:
                        success_count += 1
                    else:
                        fail_count += 1
                    
                except Exception as e:
                    print(f"Error creating relationship: {e}")
                    fail_count += 1
                
            # 显示结果
            messagebox.showinfo(
                "批量创建关系结果", 
                f"成功: {success_count}\n已存在: {already_exists}\n失败: {fail_count}"
            )
            
            # 关闭窗口
            bulk_rel_window.destroy()
        
        # 绑定事件
        db_combo.bind("<<ComboboxSelected>>", on_db_selected)
        coll_combo.bind("<<ComboboxSelected>>", on_collection_selected)
        
        # 填充初始数据
        populate_db_list()

    def delete_document(self, doc):
        """从数据库中删除文档"""
        if not doc:
            return
            
        # 获取文档ID和文件路径
        doc_id = doc.get('_id')
        if not doc_id:
            messagebox.showerror("删除错误", "文档没有有效的ID")
            return
            
        # 确认删除
        confirm = messagebox.askyesno(
            "确认删除", 
            "确定要删除这个文档吗？这个操作不可撤销，文档将从数据库中永久删除。"
        )
        
        if not confirm:
            return
            
        try:
            # 删除数据库中的文档
            db = self.db_client[self.current_db]
            collection = db[self.current_collection]
            
            # 在删除前获取完整的文档
            complete_doc = collection.find_one({"_id": doc_id})
            if not complete_doc:
                messagebox.showerror("删除错误", "无法找到要删除的文档")
                return
                
            # 执行删除操作
            result = collection.delete_one({"_id": doc_id})
            
            if result.deleted_count == 1:
                # 如果文档中有文件路径，尝试删除文件
                if 'filePath' in complete_doc:
                    file_path = complete_doc['filePath']
                    # 检查是否是相对路径
                    if file_path.startswith('/'):
                        # 转换为项目的绝对路径
                        proj_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                        abs_path = os.path.join(proj_dir, 'public', file_path.lstrip('/'))
                        
                        # 如果文件存在，删除它
                        if os.path.exists(abs_path):
                            try:
                                os.remove(abs_path)
                                messagebox.showinfo("删除成功", f"文档已从数据库删除，文件 {file_path} 也已删除。")
                            except Exception as e:
                                messagebox.showwarning("部分删除", f"文档已从数据库删除，但删除文件时出错: {str(e)}")
                        else:
                            messagebox.showinfo("删除成功", "文档已从数据库删除，但关联的文件未找到。")
                    else:
                        messagebox.showinfo("删除成功", "文档已从数据库删除。")
                else:
                    messagebox.showinfo("删除成功", "文档已从数据库删除。")
                
                # 刷新集合数据
                self.load_collection_data()
            else:
                messagebox.showerror("删除错误", "删除失败，找不到指定的文档。")
                
        except Exception as e:
            messagebox.showerror("删除错误", f"删除文档时发生错误: {str(e)}")
    
    def on_close(self):
        """处理窗口关闭事件"""
        # 保存当前配置
        self.user_config["auto_connect"] = self.auto_connect_var.get()
        self.user_config["mongodb_uri"] = self.uri_entry.get()
        save_user_config(self.user_config)
        
        if hasattr(self, 'paginated_grid') and hasattr(self.paginated_grid, 'image_loader'):
            # 停止图像加载线程
            self.paginated_grid.image_loader.stop()
            
        # 销毁窗口
        self.destroy()

def main():
    app = MongoDBViewer()
    app.mainloop()

# MongoDBViewer类 - 修改这个类以支持记住上次选择
class MongoDBViewer(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("MongoDB Art Database Viewer - Auto Connect")
        self.geometry(WINDOW_SIZE)
        
        # 加载用户配置
        self.user_config = load_user_config()
        
        # 设置MongoDB连接
        self.db_client = None
        self.current_db = None
        self.current_collection = None
        self.current_docs = []
        
        # UI配置
        self.grid_columns = self.user_config.get("grid_columns", DEFAULT_GRID_COLUMNS)
        self.image_width = 250
        self.image_height = 200
        
        # 创建主界面
        self.create_ui()
        
        # 设置窗口关闭事件
        self.protocol("WM_DELETE_WINDOW", self.on_close)
        
        # 如果配置了自动连接，则启动时自动连接MongoDB
        if self.user_config.get("auto_connect", AUTO_CONNECT):
            self.after(500, self.auto_connect_mongodb)  # 延迟500毫秒执行自动连接
        
    def create_ui(self):
        # Main split pane
        self.main_pane = ttk.PanedWindow(self, orient=tk.HORIZONTAL)
        self.main_pane.pack(fill=tk.BOTH, expand=True)
        
        # Left panel - Database browser
        self.left_frame = ttk.Frame(self.main_pane)
        self.main_pane.add(self.left_frame)
        
        # Connection frame
        conn_frame = ttk.LabelFrame(self.left_frame, text="Connection")
        conn_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(conn_frame, text="MongoDB URI:").pack(anchor=tk.W, padx=5)
        self.uri_entry = ttk.Entry(conn_frame)
        self.uri_entry.insert(0, self.user_config.get("mongodb_uri", DEFAULT_MONGODB_URI))
        self.uri_entry.pack(fill=tk.X, padx=5, pady=2)
        
        # 添加自动连接选项
        self.auto_connect_var = tk.BooleanVar(value=self.user_config.get("auto_connect", AUTO_CONNECT))
        self.auto_connect_checkbox = ttk.Checkbutton(
            conn_frame, 
            text="Auto-connect on startup",
            variable=self.auto_connect_var
        )
        self.auto_connect_checkbox.pack(anchor=tk.W, padx=5, pady=2)
        
        connect_button = ttk.Button(conn_frame, text="Connect", command=self.connect_mongodb)
        connect_button.pack(fill=tk.X, padx=5, pady=5)
        
        # Tree view for databases and collections
        tree_frame = ttk.LabelFrame(self.left_frame, text="Databases & Collections")
        tree_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        self.db_tree = ttk.Treeview(tree_frame)
        self.db_tree.pack(fill=tk.BOTH, expand=True)
        self.db_tree.bind("<<TreeviewSelect>>", self.on_tree_select)
        
        # Status bar
        self.status_var = tk.StringVar(value="Ready")
        self.status_bar = ttk.Label(self.left_frame, textvariable=self.status_var, relief=tk.SUNKEN, anchor=tk.W)
        self.status_bar.pack(fill=tk.X, padx=5, pady=5)
        
        # Control panel
        control_frame = ttk.LabelFrame(self.left_frame, text="Display Options")
        control_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(control_frame, text="Grid columns:").pack(side=tk.LEFT, padx=5)
        self.columns_var = tk.StringVar(value=str(self.grid_columns))
        columns_spinner = ttk.Spinbox(control_frame, from_=1, to=6, width=5, 
                                    textvariable=self.columns_var)
        columns_spinner.pack(side=tk.LEFT, padx=5)
        columns_spinner.bind("<<Increment>>", lambda e: self.update_grid_layout())
        columns_spinner.bind("<<Decrement>>", lambda e: self.update_grid_layout())
        
        ttk.Button(control_frame, text="Update View", 
                command=self.update_grid_layout).pack(side=tk.LEFT, padx=5)
        
        # Right panel - Document grid viewer
        self.right_frame = ttk.Frame(self.main_pane)
        self.main_pane.add(self.right_frame, weight=3)  # Give right panel more space
        
        # Create paginated grid
        self.paginated_grid = PaginatedGrid(self.right_frame)
        self.paginated_grid.pack(fill=tk.BOTH, expand=True)
        self.paginated_grid.set_context_menu_callback(self.handle_context_menu)
        
        # Bottom panel - JSON viewer
        self.json_frame = ttk.LabelFrame(self, text="Document Details")
        self.json_frame.pack(fill=tk.BOTH, padx=5, pady=5, expand=False)
        
        self.json_text = ScrolledText(self.json_frame, wrap=tk.WORD, height=10)
        self.json_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
    
    def auto_connect_mongodb(self):
        """自动连接到MongoDB数据库"""
        try:
            uri = self.uri_entry.get()
            self.update_status(f"Auto-connecting to {uri}...")
            self.db_client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=5000)
            
            # 测试连接
            self.db_client.admin.command('ping')
            
            self.update_status("Connected to MongoDB successfully")
            self.populate_db_tree()
            
            # 记住上次选择的数据库和集合
            last_db = self.user_config.get("last_db", "")
            last_collection = self.user_config.get("last_collection", "")
            
            if last_db:
                # 首先寻找并选择数据库节点
                for db_id in self.db_tree.get_children():
                    if self.db_tree.item(db_id, "text") == last_db:
                        self.db_tree.selection_set(db_id)
                        self.db_tree.see(db_id)
                        self.db_tree.item(db_id, open=True)  # 展开数据库节点
                        
                        # 如果有上次选择的集合，寻找并选择集合节点
                        if last_collection:
                            for coll_id in self.db_tree.get_children(db_id):
                                if self.db_tree.item(coll_id, "text") == last_collection:
                                    self.db_tree.selection_set(coll_id)
                                    self.db_tree.see(coll_id)
                                    self.on_tree_select(None)  # 手动触发选择事件
                                    break
                            else:
                                # 如果找不到上次的集合但找到了数据库，仍然触发数据库的选择
                                self.on_tree_select(None)
                        else:
                            # 如果没有上次选择的集合，只触发数据库的选择
                            self.on_tree_select(None)
                        break
                
        except Exception as e:
            self.update_status(f"Auto-connect failed: {str(e)}")
            messagebox.showerror("Auto-Connection Error", f"Failed to auto-connect to MongoDB: {str(e)}")
            
    def connect_mongodb(self):
        """手动连接到MongoDB数据库"""
        uri = self.uri_entry.get()
        try:
            self.update_status(f"Connecting to {uri}...")
            self.db_client = pymongo.MongoClient(uri)
            
            # 测试连接
            self.db_client.admin.command('ping')
            
            self.update_status("Connected to MongoDB successfully")
            messagebox.showinfo("Connection", "Successfully connected to MongoDB")
            self.populate_db_tree()
            
            # 记住上次选择的数据库和集合
            last_db = self.user_config.get("last_db", "")
            last_collection = self.user_config.get("last_collection", "")
            
            if last_db:
                # 与auto_connect_mongodb中相同的代码，寻找并选择上次的数据库和集合
                for db_id in self.db_tree.get_children():
                    if self.db_tree.item(db_id, "text") == last_db:
                        self.db_tree.selection_set(db_id)
                        self.db_tree.see(db_id)
                        self.db_tree.item(db_id, open=True)
                        
                        if last_collection:
                            for coll_id in self.db_tree.get_children(db_id):
                                if self.db_tree.item(coll_id, "text") == last_collection:
                                    self.db_tree.selection_set(coll_id)
                                    self.db_tree.see(coll_id)
                                    self.on_tree_select(None)
                                    break
                            else:
                                self.on_tree_select(None)
                        else:
                            self.on_tree_select(None)
                        break
            
        except Exception as e:
            self.update_status(f"Connection failed: {str(e)}")
            messagebox.showerror("Connection Error", f"Failed to connect to MongoDB: {str(e)}")
    
    def populate_db_tree(self):
        """填充数据库树视图"""
        # 清除现有内容
        self.db_tree.delete(*self.db_tree.get_children())
        
        try:
            # 获取数据库列表
            db_list = self.db_client.list_database_names()
            
            for db_name in db_list:
                # 跳过系统数据库
                if db_name in ['admin', 'local', 'config']:
                    continue
                    
                # 添加数据库节点
                db_node = self.db_tree.insert("", "end", text=db_name, open=False)
                
                # 添加集合节点
                try:
                    collections = self.db_client[db_name].list_collection_names()
                    for coll_name in collections:
                        self.db_tree.insert(db_node, "end", text=coll_name)
                except Exception as e:
                    print(f"Error accessing collections in {db_name}: {e}")
                    
        except Exception as e:
            messagebox.showerror("Error", f"Failed to get database list: {str(e)}")
            
    def on_tree_select(self, event):
        """处理树视图选择事件"""
        selected_items = self.db_tree.selection()
        if not selected_items:
            return
            
        item_id = selected_items[0]
        item_text = self.db_tree.item(item_id, "text")
        parent_id = self.db_tree.parent(item_id)
        
        if parent_id:  # 这是一个集合
            parent_text = self.db_tree.item(parent_id, "text")
            self.current_db = parent_text
            self.current_collection = item_text
            
            # 保存选择到配置
            self.user_config["last_db"] = parent_text
            self.user_config["last_collection"] = item_text
            save_user_config(self.user_config)
            
            self.update_status(f"Selected collection: {parent_text}.{item_text}")
            
            # 加载集合数据
            self.load_collection_data()
        else:  # 这是一个数据库
            self.current_db = item_text
            self.current_collection = None
            
            # 保存选择到配置
            self.user_config["last_db"] = item_text
            self.user_config["last_collection"] = ""
            save_user_config(self.user_config)
            
            # 如果未展开，则展开数据库节点
            if not self.db_tree.item(item_id, "open"):
                self.db_tree.item(item_id, open=True)
    
    def load_collection_data(self):
        """加载集合数据"""
        if not self.db_client or not self.current_db or not self.current_collection:
            return
            
        self.update_status(f"Loading documents from {self.current_db}.{self.current_collection}...")
        
        # 创建一个线程来加载数据，以保持UI响应
        threading.Thread(target=self._load_data_thread, daemon=True).start()
    
    def _load_data_thread(self):
        """在后台线程中加载数据"""
        try:
            collection = self.db_client[self.current_db][self.current_collection]
            cursor = collection.find()
            docs = list(cursor)
            
            # 添加图片验证 - 确保数据库与实际显示内容一致
            docs = self.validate_documents_with_files(docs)
            
            # 更新UI（必须在主线程中完成）
            self.after(0, lambda: self.update_grid_with_docs(docs))
            
        except Exception as e:
            self.after(0, lambda: self.update_status(f"Error loading data: {str(e)}"))
            self.after(0, lambda: messagebox.showerror("Data Error", f"Failed to load documents: {str(e)}"))
    
    def validate_documents_with_files(self, docs):
        """验证文档与文件的一致性 - 以数据库为准"""
        if not docs:
            return []
            
        validated_docs = []
        inconsistencies = []
        
        # 项目根目录路径，用于定位图片文件
        proj_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        
        for doc in docs:
            # 检查文档是否有文件路径
            if 'filePath' in doc:
                file_path = doc['filePath']
                
                # 检查路径是否为相对路径
                if file_path.startswith('/'):
                    # 转换为项目的绝对路径
                    abs_path = os.path.join(proj_dir, 'public', file_path.lstrip('/'))
                    
                    # 检查文件是否实际存在
                    if not os.path.exists(abs_path):
                        inconsistencies.append(f"文件不存在: {file_path} (文档ID: {doc.get('_id')})")
                        # 标记文档中的文件路径问题
                        doc['_file_missing'] = True
                
            # 无论文件是否存在，都保留数据库中的文档
            validated_docs.append(doc)
            
        # 如果发现不一致，显示警告
        if inconsistencies:
            inconsistency_text = "\n".join(inconsistencies[:10])
            if len(inconsistencies) > 10:
                inconsistency_text += f"\n...以及其他 {len(inconsistencies) - 10} 个问题"
                
            self.after(0, lambda: messagebox.showwarning(
                "数据库与文件不一致", 
                f"发现 {len(inconsistencies)} 个文件与数据库记录不一致:\n\n{inconsistency_text}\n\n" +
                "显示将以数据库内容为准。标记有问题的记录将显示特殊标记。"
            ))
            
            # 记录详细不一致到日志文件
            self.log_inconsistencies(inconsistencies)
            
        return validated_docs
        
    def log_inconsistencies(self, inconsistencies):
        """将不一致记录到日志文件"""
        if not inconsistencies:
            return
            
        log_dir = os.path.dirname(os.path.abspath(__file__))
        log_file = os.path.join(log_dir, "db_file_inconsistencies.log")
        
        try:
            with open(log_file, 'a', encoding='utf-8') as f:
                f.write(f"\n--- 检测时间: {datetime.datetime.now().isoformat()} ---\n")
                f.write(f"数据库: {self.current_db}, 集合: {self.current_collection}\n")
                for item in inconsistencies:
                    f.write(f"{item}\n")
                f.write("-" * 50 + "\n")
                
            self.update_status(f"不一致记录已写入日志: {log_file}")
        except Exception as e:
            print(f"写入日志失败: {e}")
    
    def update_grid_with_docs(self, docs):
        """使用文档更新网格视图"""
        self.current_docs = docs
        
        if not docs:
            self.update_status("No documents found in the collection")
            # 清空网格
            self.paginated_grid.set_items([])
            return
            
        # 更新网格
        self.paginated_grid.set_items(docs)
        
        # 更新状态
        self.update_status(f"Loaded {len(docs)} documents from {self.current_db}.{self.current_collection}")
    
    def update_status(self, message):
        """更新状态栏消息"""
        self.status_var.set(message)
        
    def update_grid_layout(self):
        """更新网格布局"""
        try:
            cols = int(self.columns_var.get())
            if cols < 1:
                cols = 1
            elif cols > 6:
                cols = 6
                
            self.grid_columns = cols
            self.paginated_grid.set_columns(cols)
            
            # 保存列数到配置
            self.user_config["grid_columns"] = cols
            save_user_config(self.user_config)
            
            # 更新显示
            self.paginated_grid.refresh_grid()
            
        except ValueError:
            # 如果输入值不是数字
            self.columns_var.set(str(self.grid_columns))
    
    def handle_context_menu(self, action, doc):
        """处理上下文菜单操作"""
        if action == "view":
            self.show_document_details(doc)
        elif action == "relate":
            self.create_relationship(doc)
        elif action == "export":
            self.export_document(doc)
        elif action == "delete":
            self.delete_document(doc)
        elif action == "bulk_export":
            # 批量导出
            self.bulk_export_documents(doc)  # 这里传入的doc实际上是文档列表
        elif action == "bulk_relate":
            # 批量创建关系
            self.bulk_create_relationships(doc)  # 这里传入的doc实际上是文档列表
    
    def show_document_details(self, doc):
        """显示文档详细信息"""
        # 显示格式化的JSON
        json_str = json.dumps(self.bson_to_json(doc), indent=2)
        self.json_text.delete(1.0, tk.END)
        self.json_text.insert(tk.END, json_str)
    
    def create_relationship(self, doc):
        """创建关系对话框"""
        # 创建一个新窗口
        rel_window = tk.Toplevel(self)
        rel_window.title("Create Relationship")
        rel_window.geometry("800x600")
        rel_window.grab_set()  # 模态窗口
        
        # 创建关系管理器
        rel_manager = RelationshipManager(rel_window, self.db_client, doc)
        rel_manager.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
    
    def export_document(self, doc):
        """导出文档到JSON文件"""
        if not doc:
            return
            
        # 获取保存文件路径
        default_name = f"{self.current_collection}_{str(doc.get('_id', 'doc'))}.json"
        file_path = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")],
            initialfile=default_name
        )
        
        if not file_path:
            return
            
        try:
            # 将文档导出为JSON
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(self.bson_to_json(doc), f, indent=2, ensure_ascii=False)
                
            messagebox.showinfo("Export", f"Document exported to {file_path}")
            
        except Exception as e:
            messagebox.showerror("Export Error", f"Failed to export document: {str(e)}")
    
    def bson_to_json(self, doc):
        """将BSON文档转换为JSON可序列化格式"""
        json_doc = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                json_doc[key] = str(value)
            elif isinstance(value, datetime.datetime):  # 处理datetime类型
                json_doc[key] = value.isoformat()
            elif isinstance(value, dict):
                json_doc[key] = self.bson_to_json(value)
            elif isinstance(value, list):
                json_doc[key] = [
                    self.bson_to_json(item) if isinstance(item, dict) else (
                        item.isoformat() if isinstance(item, datetime.datetime) else item
                    ) for item in value
                ]
            else:
                json_doc[key] = value
                
        return json_doc
    
    def bulk_export_documents(self, docs):
        """批量导出多个文档到JSON文件"""
        if not docs:
            return
        
        # 首先让用户选择一个目录
        export_dir = filedialog.askdirectory(
            title="选择导出目录"
        )
        
        if not export_dir:
            return
        
        try:
            # 跟踪成功和失败的数量
            success_count = 0
            fail_count = 0
            
            for doc in docs:
                try:
                    # 生成文件名
                    filename = f"{self.current_collection}_{str(doc.get('_id', 'doc'))}.json"
                    file_path = os.path.join(export_dir, filename)
                    
                    # 导出为JSON
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(self.bson_to_json(doc), f, indent=2, ensure_ascii=False)
                        
                    success_count += 1
                except Exception as e:
                    print(f"Error exporting {doc.get('_id')}: {e}")
                    fail_count += 1
                    
            # 显示结果
            if success_count > 0:
                messagebox.showinfo("批量导出", f"成功导出 {success_count} 个文件到 {export_dir}\n失败: {fail_count}")
            else:
                messagebox.showerror("批量导出", f"导出失败。\n失败: {fail_count}")
                
        except Exception as e:
            messagebox.showerror("批量导出错误", f"导出过程发生错误: {str(e)}")
    
    def bulk_create_relationships(self, docs):
        """批量创建关系"""
        if not docs or len(docs) == 0:
            return
        
        # 创建一个新窗口
        bulk_rel_window = tk.Toplevel(self)
        bulk_rel_window.title("批量创建关系")
        bulk_rel_window.geometry("800x600")
        bulk_rel_window.grab_set()  # 模态窗口
        
        # 创建界面
        frame = ttk.Frame(bulk_rel_window, padding=10)
        frame.pack(fill=tk.BOTH, expand=True)
        
        # 显示选中的文档数
        ttk.Label(frame, text=f"已选择 {len(docs)} 个文档作为源", font=('Arial', 12, 'bold')).pack(anchor=tk.W, pady=(0, 10))
        
        # 关系类型选择
        ttk.Label(frame, text="选择关系类型:").pack(anchor=tk.W)
        rel_type_var = tk.StringVar()
        rel_type_combo = ttk.Combobox(frame, textvariable=rel_type_var, values=RELATIONSHIP_TYPES)
        rel_type_combo.pack(fill=tk.X, pady=5)
        
        # 目标选择部分
        target_frame = ttk.LabelFrame(frame, text="选择目标文档")
        target_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # 数据库选择
        db_frame = ttk.Frame(target_frame)
        db_frame.pack(fill=tk.X, pady=5)
        ttk.Label(db_frame, text="数据库:").pack(side=tk.LEFT)
        db_var = tk.StringVar()
        db_combo = ttk.Combobox(db_frame, textvariable=db_var)
        db_combo.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        
        # 集合选择
        coll_frame = ttk.Frame(target_frame)
        coll_frame.pack(fill=tk.X, pady=5)
        ttk.Label(coll_frame, text="集合:").pack(side=tk.LEFT)
        coll_var = tk.StringVar()
        coll_combo = ttk.Combobox(coll_frame, textvariable=coll_var)
        coll_combo.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        
        # 文档列表
        doc_frame = ttk.Frame(target_frame)
        doc_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        ttk.Label(doc_frame, text="选择目标文档:").pack(anchor=tk.W)
        
        # 目标文档列表框
        list_frame = ttk.Frame(doc_frame)
        list_frame.pack(fill=tk.BOTH, expand=True)
        
        target_listbox = tk.Listbox(list_frame, selectmode=tk.SINGLE)
        target_scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=target_listbox.yview)
        target_listbox.config(yscrollcommand=target_scrollbar.set)
        
        target_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        target_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # 保存加载的文档
        target_docs = []
        
        # 操作按钮
        btn_frame = ttk.Frame(frame)
        btn_frame.pack(fill=tk.X, pady=10)
        
        ttk.Button(btn_frame, text="取消", command=bulk_rel_window.destroy).pack(side=tk.RIGHT, padx=5)
        create_btn = ttk.Button(btn_frame, text="创建关系", 
                             command=lambda: create_relationships())
        create_btn.pack(side=tk.RIGHT, padx=5)
        
        # 状态显示
        status_var = tk.StringVar(value="请选择关系类型和目标文档")
        status_label = ttk.Label(frame, textvariable=status_var, foreground="gray")
        status_label.pack(side=tk.BOTTOM, fill=tk.X)
        
        # 填充数据库列表
        def populate_db_list():
            try:
                db_list = self.db_client.list_database_names()
                # 过滤系统数据库
                db_list = [db for db in db_list if db not in ['admin', 'local', 'config']]
                db_combo['values'] = db_list
                if db_list:
                    db_combo.current(0)
                    on_db_selected()
            except Exception as e:
                status_var.set(f"获取数据库列表失败: {e}")
        
        # 处理数据库选择
        def on_db_selected(*args):
            selected_db = db_var.get()
            try:
                if selected_db:
                    collections = self.db_client[selected_db].list_collection_names()
                    coll_combo['values'] = collections
                    if collections:
                        coll_combo.current(0)
                        on_collection_selected()
                    else:
                        coll_combo.set("")
                        target_listbox.delete(0, tk.END)
                        target_docs.clear()
            except Exception as e:
                status_var.set(f"获取集合列表失败: {e}")
        
        # 处理集合选择
        def on_collection_selected(*args):
            selected_db = db_var.get()
            selected_coll = coll_var.get()
            
            target_listbox.delete(0, tk.END)
            target_docs.clear()
            
            if not selected_db or not selected_coll:
                return
            
            try:
                collection = self.db_client[selected_db][selected_coll]
                # 限制加载的文档数量
                found_docs = list(collection.find().limit(100))
                target_docs.extend(found_docs)
                
                # 填充列表框
                for doc in found_docs:
                    display_name = doc.get('title', doc.get('name', doc.get('filename', str(doc.get('_id')))))
                    target_listbox.insert(tk.END, display_name)
                    
                status_var.set(f"加载了 {len(found_docs)} 个文档")
            except Exception as e:
                status_var.set(f"加载文档失败: {e}")
        
        # 创建关系
        def create_relationships():
            selected_rel_type = rel_type_var.get()
            if not selected_rel_type:
                messagebox.showwarning("缺少关系类型", "请选择一个关系类型")
                return
            
            selection = target_listbox.curselection()
            if not selection:
                messagebox.showwarning("未选择目标", "请选择一个目标文档")
                return
            
            index = selection[0]
            target_doc = target_docs[index]
            
            selected_db = db_var.get()
            selected_coll = coll_var.get()
            
            # 创建关系数据库如果不存在
            relationships_db = self.db_client.get_database('relationships')
            rel_collection = relationships_db['art_relationships']
            
            # 跟踪成功和失败的数量
            success_count = 0
            fail_count = 0
            already_exists = 0
            
            for source_doc in docs:
                try:
                    source_id = source_doc.get('_id')
                    target_id = target_doc.get('_id')
                    
                    if not source_id or not target_id:
                        fail_count += 1
                        continue
                    
                    # 检查是否已存在相同的关系
                    existing = rel_collection.find_one({
                        'sourceId': source_id,
                        'targetId': target_id,
                        'type': selected_rel_type
                    })
                    
                    if existing:
                        already_exists += 1
                        continue
                    
                    # 创建关系文档
                    relationship = {
                        'sourceId': source_id,
                        'sourceCollection': self.current_collection,
                        'targetId': target_id,
                        'targetCollection': selected_coll,
                        'type': selected_rel_type,
                        'created': time.time()
                    }
                    
                    # 插入关系
                    result = rel_collection.insert_one(relationship)
                    
                    if result.inserted_id:
                        success_count += 1
                    else:
                        fail_count += 1
                    
                except Exception as e:
                    print(f"Error creating relationship: {e}")
                    fail_count += 1
                
            # 显示结果
            messagebox.showinfo(
                "批量创建关系结果", 
                f"成功: {success_count}\n已存在: {already_exists}\n失败: {fail_count}"
            )
            
            # 关闭窗口
            bulk_rel_window.destroy()
        
        # 绑定事件
        db_combo.bind("<<ComboboxSelected>>", on_db_selected)
        coll_combo.bind("<<ComboboxSelected>>", on_collection_selected)
        
        # 填充初始数据
        populate_db_list()

    def delete_document(self, doc):
        """从数据库中删除文档"""
        if not doc:
            return
            
        # 获取文档ID和文件路径
        doc_id = doc.get('_id')
        if not doc_id:
            messagebox.showerror("删除错误", "文档没有有效的ID")
            return
            
        # 确认删除
        confirm = messagebox.askyesno(
            "确认删除", 
            "确定要删除这个文档吗？这个操作不可撤销，文档将从数据库中永久删除。"
        )
        
        if not confirm:
            return
            
        try:
            # 删除数据库中的文档
            db = self.db_client[self.current_db]
            collection = db[self.current_collection]
            
            # 在删除前获取完整的文档
            complete_doc = collection.find_one({"_id": doc_id})
            if not complete_doc:
                messagebox.showerror("删除错误", "无法找到要删除的文档")
                return
                
            # 执行删除操作
            result = collection.delete_one({"_id": doc_id})
            
            if result.deleted_count == 1:
                # 如果文档中有文件路径，尝试删除文件
                if 'filePath' in complete_doc:
                    file_path = complete_doc['filePath']
                    # 检查是否是相对路径
                    if file_path.startswith('/'):
                        # 转换为项目的绝对路径
                        proj_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                        abs_path = os.path.join(proj_dir, 'public', file_path.lstrip('/'))
                        
                        # 如果文件存在，删除它
                        if os.path.exists(abs_path):
                            try:
                                os.remove(abs_path)
                                messagebox.showinfo("删除成功", f"文档已从数据库删除，文件 {file_path} 也已删除。")
                            except Exception as e:
                                messagebox.showwarning("部分删除", f"文档已从数据库删除，但删除文件时出错: {str(e)}")
                        else:
                            messagebox.showinfo("删除成功", "文档已从数据库删除，但关联的文件未找到。")
                    else:
                        messagebox.showinfo("删除成功", "文档已从数据库删除。")
                else:
                    messagebox.showinfo("删除成功", "文档已从数据库删除。")
                
                # 刷新集合数据
                self.load_collection_data()
            else:
                messagebox.showerror("删除错误", "删除失败，找不到指定的文档。")
                
        except Exception as e:
            messagebox.showerror("删除错误", f"删除文档时发生错误: {str(e)}")
    
    def on_close(self):
        """处理窗口关闭事件"""
        # 保存当前配置
        self.user_config["auto_connect"] = self.auto_connect_var.get()
        self.user_config["mongodb_uri"] = self.uri_entry.get()
        save_user_config(self.user_config)
        
        if hasattr(self, 'paginated_grid') and hasattr(self.paginated_grid, 'image_loader'):
            # 停止图像加载线程
            self.paginated_grid.image_loader.stop()
            
        # 销毁窗口
        self.destroy()

if __name__ == "__main__":
    main() 