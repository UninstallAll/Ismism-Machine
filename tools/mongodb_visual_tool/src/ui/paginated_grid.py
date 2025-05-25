#!/usr/bin/env python3
"""
Paginated Grid Component - For displaying paginated image cards
"""
import tkinter as tk
from tkinter import ttk, Menu, messagebox
import math
import os
from PIL import Image, ImageTk
from rapidfuzz import fuzz
import json

from ..config.settings import DEFAULT_PAGE_SIZE
from .image_card import ImageCard
from ..utils.image_loader import ImageLoader

class PaginatedGrid(ttk.Frame):
    """Paginated grid component for displaying image cards"""
    
    def __init__(self, parent, page_size=DEFAULT_PAGE_SIZE, on_show_details=None):
        """Initialize the paginated grid
        
        Args:
            parent: Parent component
            page_size (int, optional): Number of items to display per page
            on_show_details (callable, optional): Callback function for showing document details
        """
        super().__init__(parent)
        
        # Basic properties
        self.parent = parent
        self.page_size = 50  # Default 50 items per page
        self.columns = 3     # Initial column count, will be adjusted automatically
        self.current_page = 1
        self.total_pages = 1
        self.all_items = []  # All items
        self.filtered_items = []  # Filtered items
        self.displayed_cards = []  # Currently displayed cards
        self.selected_docs = []  # Selected documents
        self.context_menu_callback = None
        self.current_view = "grid"  # Default view mode (grid or list)
        self.on_show_details = on_show_details
        self.current_schema = None  # 添加：当前集合的schema
        
        # Control key states
        self.ctrl_pressed = False
        self.shift_pressed = False
        
        # Mouse drag selection
        self.drag_start_x = 0
        self.drag_start_y = 0
        self.is_dragging = False
        self.selection_rect = None
        
        # Search history
        self.search_history = []
        
        # Sorting related properties
        self.sort_field = "filename"
        self.sort_reverse = False
        
        # Last selected index
        self.last_selected_index = None
        
        # Selection mode
        self.selection_mode = "multi"  # multi/single selection mode
        
        # Create UI
        self._create_ui()
        
        # Create image loader
        self.image_loader = ImageLoader(self._on_image_loaded, num_workers=4)
        
        # Bind keyboard shortcuts
        self._bind_keyboard_shortcuts()
        
    def _bind_keyboard_shortcuts(self):
        """Bind keyboard shortcuts"""
        # Bind Ctrl key press and release events
        self.bind_all("<Control-KeyPress>", self._on_ctrl_key_press)
        self.bind_all("<Control-KeyRelease>", self._on_ctrl_key_release)
        
        # Bind Shift key press and release events
        self.bind_all("<Shift-KeyPress>", self._on_shift_key_press)
        self.bind_all("<Shift-KeyRelease>", self._on_shift_key_release)
        
        # Bind combination keys
        self.bind_all("<Control-a>", self._select_all_shortcut)
        self.bind_all("<Control-d>", self._deselect_all_shortcut)
        self.bind_all("<Control-i>", self._invert_selection_shortcut)
    
    def _on_ctrl_key_press(self, event):
        """Handle Ctrl key press event"""
        self.ctrl_pressed = True
    
    def _on_ctrl_key_release(self, event):
        """Handle Ctrl key release event"""
        self.ctrl_pressed = False
    
    def _on_shift_key_press(self, event):
        """Handle Shift key press event"""
        self.shift_pressed = True
    
    def _on_shift_key_release(self, event):
        """Handle Shift key release event"""
        self.shift_pressed = False
    
    def _select_all_shortcut(self, event):
        """Handle Ctrl+A shortcut"""
        if self.selection_mode == "multi":
            if self.current_view == "grid":
                for card in self.displayed_cards:
                    card.set_selected(True)
            else:
                # 列表模式下选择所有项
                self.list_view.selection_set(*self.list_view.get_children())
                self._on_list_selection_changed()
            self._update_selection_ui()
        return "break"
    
    def _deselect_all_shortcut(self, event):
        """Handle Ctrl+D shortcut"""
        if self.selection_mode == "multi":
            if self.current_view == "grid":
                for card in self.displayed_cards:
                    card.set_selected(False)
            else:
                # 列表模式下取消所有选择
                self.list_view.selection_remove(*self.list_view.get_children())
                self._on_list_selection_changed()
            self._update_selection_ui()
        return "break"
    
    def _invert_selection_shortcut(self, event):
        """Handle Ctrl+I shortcut"""
        if self.selection_mode == "multi":
            if self.current_view == "grid":
                for card in self.displayed_cards:
                    card.set_selected(not card.is_selected)
            else:
                # 列表模式下反转选择
                all_items = self.list_view.get_children()
                selected_items = self.list_view.selection()
                for item in all_items:
                    if item in selected_items:
                        self.list_view.selection_remove(item)
                    else:
                        self.list_view.selection_add(item)
                self._on_list_selection_changed()
            self._update_selection_ui()
        return "break"
        
    def _create_ui(self):
        """Create UI components"""
        # Main frame
        self.main_frame = ttk.Frame(self)
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Top toolbar
        self.toolbar = ttk.Frame(self.main_frame)
        self.toolbar.pack(fill=tk.X, padx=5, pady=5)
        
        # Add search box
        ttk.Label(self.toolbar, text="Search:").pack(side=tk.LEFT, padx=(0, 5))
        
        self.search_var = tk.StringVar()
        self.search_var.trace("w", self._on_search_text_changed)
        
        self.search_entry = ttk.Entry(self.toolbar, width=30, textvariable=self.search_var)
        self.search_entry.pack(side=tk.LEFT, padx=5)
        self.search_entry.bind("<Return>", self._on_search)
        
        # Search button
        self.search_button = ttk.Button(self.toolbar, text="Search", command=self._on_search)
        self.search_button.pack(side=tk.LEFT, padx=5)
        
        # Clear search button
        self.clear_button = ttk.Button(self.toolbar, text="Clear", command=self._clear_search)
        self.clear_button.pack(side=tk.LEFT, padx=5)
        
        # Search history button
        self.history_button = ttk.Button(self.toolbar, text="History", command=self._show_search_history)
        self.history_button.pack(side=tk.LEFT, padx=5)
        
        # View switch button
        self.view_button = ttk.Button(self.toolbar, text="Switch View", command=self._switch_view_mode)
        self.view_button.pack(side=tk.LEFT, padx=5)
        
        # Column settings button
        self.column_settings_button = ttk.Button(self.toolbar, text="Columns", command=self._show_column_settings)
        self.column_settings_button.pack(side=tk.LEFT, padx=5)
        
        # --- Sorting controls ---
        ttk.Label(self.toolbar, text="Sort by:").pack(side=tk.LEFT, padx=(20, 2))
        self.sort_field_var = tk.StringVar(value="filename")
        self.sort_field_combo = ttk.Combobox(
            self.toolbar,
            textvariable=self.sort_field_var,
            values=["filename", "importedAt", "size", "artMovement"],
            width=12,
            state="readonly"
        )
        self.sort_field_combo.pack(side=tk.LEFT, padx=2)
        self.sort_field_combo.bind("<<ComboboxSelected>>", self._on_sort_changed)
        # --- Double sorting buttons ---
        self.asc_button = ttk.Button(self.toolbar, text="↑", width=2, command=lambda: self._set_sort_order(False))
        self.desc_button = ttk.Button(self.toolbar, text="↓", width=2, command=lambda: self._set_sort_order(True))
        self.asc_button.pack(side=tk.LEFT, padx=0)
        self.desc_button.pack(side=tk.LEFT, padx=(0, 8))
        self._update_sort_buttons()
        # --- End of sorting controls ---
        
        # Bulk operations buttons
        self.operations_frame = ttk.Frame(self.toolbar)
        self.operations_frame.pack(side=tk.RIGHT)
        self.select_all_btn = ttk.Button(self.operations_frame, text="Select All", command=self._toggle_select_all)
        self.select_all_btn.pack(side=tk.LEFT, padx=2)
        ttk.Button(self.operations_frame, text="Bulk Export", command=self._bulk_export).pack(side=tk.LEFT, padx=2)
        ttk.Button(self.operations_frame, text="Create Relation", command=self._bulk_create_relation).pack(side=tk.LEFT, padx=2)
        
        # Create list and grid view containers
        self.view_container = ttk.Frame(self.main_frame)
        self.view_container.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # List view - Tree view
        self.list_frame = ttk.Frame(self.view_container)
        
        # 创建Treeview时不指定columns，后面动态设置
        self.list_view = ttk.Treeview(self.list_frame, show="headings", selectmode="extended")
        
        # 绑定列头拖动事件
        self.list_view.bind('<Button-1>', self._on_column_click)
        self.list_view.bind('<B1-Motion>', self._on_column_drag)
        self.list_view.bind('<ButtonRelease-1>', self._on_column_drop)
        
        vsb = ttk.Scrollbar(self.list_frame, orient="vertical", command=self.list_view.yview)
        hsb = ttk.Scrollbar(self.list_frame, orient="horizontal", command=self.list_view.xview)
        self.list_view.configure(yscrollcommand=vsb.set, xscrollcommand=hsb.set)
        
        vsb.pack(side=tk.RIGHT, fill=tk.Y)
        hsb.pack(side=tk.BOTTOM, fill=tk.X)
        self.list_view.pack(fill=tk.BOTH, expand=True)
        self.list_view.bind("<<TreeviewSelect>>", self._on_list_selection_changed)
        self.list_view.bind("<Button-3>", self._show_list_context_menu)
        self.list_view.bind("<Double-1>", self._on_list_item_double_click)
        
        # 初始化列拖动变量
        self._drag_column = None
        self._drag_position = None
        
        # 初始化列配置
        self.column_config = {}
        self.load_column_config()
        
        # Grid view - Canvas + Frame
        self.grid_frame = ttk.Frame(self.view_container)
        
        # 使用canvas支持滚动
        self.canvas = tk.Canvas(self.grid_frame, borderwidth=0, highlightthickness=0)
        self.scrollbar = ttk.Scrollbar(self.grid_frame, orient=tk.VERTICAL, command=self.canvas.yview)
        self.canvas.configure(yscrollcommand=self.scrollbar.set)
        
        # 设置最小尺寸
        self.canvas.configure(width=400, height=300)
        
        # 正确的布局顺序
        self.scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # 内部frame用于放置卡片
        self.cards_frame = ttk.Frame(self.canvas)
        self.canvas_window = self.canvas.create_window((0, 0), window=self.cards_frame, anchor=tk.NW, width=self.canvas.winfo_width())
        
        # 绑定canvas大小变化事件
        self.canvas.bind('<Configure>', self._on_canvas_configure)
        self.cards_frame.bind('<Configure>', self._on_frame_configure)
        
        # 设置网格视图为默认
        self.grid_frame.pack(fill=tk.BOTH, expand=True)
        
        # Pagination frame
        self.pagination_frame = ttk.Frame(self.main_frame)
        self.pagination_frame.pack(fill=tk.X, padx=5, pady=5)
        
        # Left side pagination buttons
        self.prev_button = ttk.Button(self.pagination_frame, text="Previous Page", command=self.prev_page)
        self.prev_button.pack(side=tk.LEFT, padx=5)
        
        # Current page/total pages label
        self.page_info = ttk.Label(self.pagination_frame, text="Page 1 of 1")
        self.page_info.pack(side=tk.LEFT, padx=5)
        
        # Right side pagination buttons
        self.next_button = ttk.Button(self.pagination_frame, text="Next Page", command=self.next_page)
        self.next_button.pack(side=tk.LEFT, padx=5)
        
        # Items per page selection
        ttk.Label(self.pagination_frame, text="Items per page:").pack(side=tk.LEFT, padx=(20, 5))
        
        self.page_size_var = tk.StringVar(value=str(self.page_size))
        self.page_size_combo = ttk.Combobox(self.pagination_frame, 
                                          textvariable=self.page_size_var,
                                          values=["10", "20", "50", "100", "All"],
                                          width=5)
        self.page_size_combo.pack(side=tk.LEFT)
        self.page_size_combo.bind("<<ComboboxSelected>>", self._on_page_size_changed)
        
        # Bind resize events
        self.cards_frame.bind("<Configure>", self._on_frame_configure)
        self.canvas.bind("<Configure>", self._on_canvas_configure)
        
        # Bind mouse events
        self.canvas.bind_all("<MouseWheel>", self._on_mouse_wheel)  # Windows
        self.canvas.bind_all("<Button-4>", self._on_linux_scroll)   # Linux scroll up
        self.canvas.bind_all("<Button-5>", self._on_linux_scroll)   # Linux scroll down
        
        # Bind mouse drag events
        self.canvas.bind("<ButtonPress-1>", self._on_mouse_down)
        self.canvas.bind("<B1-Motion>", self._on_mouse_drag)
        self.canvas.bind("<ButtonRelease-1>", self._on_mouse_release)
        
        # --- Bottom status bar ---
        self.status_frame = ttk.Frame(self.main_frame)
        self.status_frame.pack(fill=tk.X, padx=5, pady=(0, 5), side=tk.BOTTOM)
        self.status_var = tk.StringVar(value="Total: 0, Selected: 0")
        self.status_label = ttk.Label(self.status_frame, textvariable=self.status_var, anchor="w")
        self.status_label.pack(side=tk.LEFT, fill=tk.X, expand=True)
        # --- Column count settings ---
        ttk.Label(self.status_frame, text="Columns:").pack(side=tk.RIGHT, padx=(2, 0))
        self.columns_var = tk.StringVar(value=str(self.columns))
        self.columns_combo = ttk.Combobox(
            self.status_frame,
            textvariable=self.columns_var,
            values=[str(i) for i in range(2, 9)],
            width=3,
            state="readonly"
        )
        self.columns_combo.pack(side=tk.RIGHT, padx=(0, 8))
        self.columns_combo.bind("<<ComboboxSelected>>", self._on_columns_changed)
        # --- End of status bar ---
        # --- Shortcut key instructions ---
        self.shortcut_frame = ttk.Frame(self.main_frame)
        self.shortcut_frame.pack(fill=tk.X, padx=5, pady=(0, 0), side=tk.BOTTOM)
        shortcut_text = (
            "Shortcuts: Ctrl+A Select All   Ctrl+D Deselect All   Ctrl+I Invert Selection   Shift+Click Range Select   Ctrl+Click Multi Select"
        )
        self.shortcut_label = ttk.Label(self.shortcut_frame, text=shortcut_text, anchor="w", foreground="#666666")
        self.shortcut_label.pack(fill=tk.X)
        # --- End of shortcut instructions ---
        
        # 新增：选择模式切换按钮
        self.select_mode_btn = ttk.Button(self.toolbar, text="Switch to Single Selection", command=self._toggle_selection_mode)
        self.select_mode_btn.pack(side=tk.LEFT, padx=5)
    
    def _switch_view_mode(self):
        """Switch view mode (grid/list)"""
        try:
            if self.current_view == "grid":
                self.current_view = "list"
                self.grid_frame.pack_forget()
                self.list_frame.pack(fill=tk.BOTH, expand=True)
                self.view_button.configure(text="Switch to Grid View")
                self.refresh_list()
            else:
                self.current_view = "grid"
                self.list_frame.pack_forget()
                self.grid_frame.pack(fill=tk.BOTH, expand=True)
                self.view_button.configure(text="Switch to List View")
                # 确保清理旧的部件
                for widget in self.cards_frame.winfo_children():
                    widget.destroy()
                self.refresh_grid()
        except Exception as e:
            print(f"Error switching view mode: {e}")
            messagebox.showerror("Error", f"Failed to switch view mode: {str(e)}")
    
    def set_context_menu_callback(self, callback):
        """Set context menu callback function
        
        Args:
            callback (callable): Callback function
        """
        self.context_menu_callback = callback
    
    def _on_image_loaded(self, card, success):
        """Image loaded callback
        
        Args:
            card: Image card object
            success (bool): Whether loading was successful
        """
        if not card or not card.winfo_exists():
            return
        
        # 更新卡片状态
        if success:
            card.update_status("Ready")
        else:
            card.update_status("Failed to load")
        
        # 刷新UI
        self.update()
    
    def refresh_grid(self):
        """Refresh grid view"""
        try:
            # 清除现有卡片
            for card in self.displayed_cards:
                if card.winfo_exists():
                    card.destroy()
            self.displayed_cards.clear()
            
            # 清理cards_frame中的所有部件
            for widget in self.cards_frame.winfo_children():
                widget.destroy()
            
            # 计算当前页要显示的项目
            start_index = (self.current_page - 1) * self.page_size
            end_index = min(start_index + self.page_size, len(self.filtered_items))
            
            # 确保起始索引有效
            if start_index >= len(self.filtered_items) and self.current_page > 1:
                self.current_page = max(1, self.current_page - 1)
                start_index = (self.current_page - 1) * self.page_size
                end_index = min(start_index + self.page_size, len(self.filtered_items))
            
            # 当前页的项目
            current_page_items = self.filtered_items[start_index:end_index]
            
            # 重置网格配置
            for i in range(self.columns):
                self.cards_frame.grid_columnconfigure(i, weight=1)
            
            # 创建新卡片
            row = 0
            col = 0
            for item in current_page_items:
                try:
                    # 检查文档是否包含必要的字段
                    if not item:
                        print("Warning: Empty document encountered")
                        continue
                    
                    # 打印调试信息
                    print(f"Processing document: {item.get('_id')}")
                    print(f"File path: {item.get('filePath')}")
                    print(f"Filename: {item.get('filename')}")
                    
                    # 创建卡片并传递完整的文档
                    card = ImageCard(self.cards_frame, doc=item, on_select_callback=self._on_card_selected)
                    
                    # 设置网格位置
                    card.grid(row=row, column=col, padx=5, pady=5, sticky="nsew")
                    
                    # 添加到显示列表
                    self.displayed_cards.append(card)
                    
                    # 加载图片
                    card.load_image()
                    
                    # 设置右键菜单
                    if self.context_menu_callback:
                        card.setup_context_menu(self.context_menu_callback)
                    
                    # 更新行列位置
                    col += 1
                    if col >= self.columns:
                        col = 0
                        row += 1
                        self.cards_frame.grid_rowconfigure(row, weight=1)
                    
                except Exception as e:
                    print(f"Error creating card for document {item.get('_id')}: {e}")
                    import traceback
                    traceback.print_exc()
            
            # 确保最后一行也配置了权重
            if row > 0:
                self.cards_frame.grid_rowconfigure(row, weight=1)
            
            # 更新canvas的滚动区域
            self.cards_frame.update_idletasks()
            bbox = self.canvas.bbox("all")
            if bbox:
                self.canvas.configure(scrollregion=bbox)
            
            # 更新分页控件
            self._update_pagination_controls()
            self._update_select_all_btn()
            self._update_status_bar()
            
            # 强制更新显示
            self.update_idletasks()
            
        except Exception as e:
            print(f"Error in refresh_grid: {e}")
            import traceback
            traceback.print_exc()
    
    def refresh_list(self):
        """Refresh list view"""
        # Clear existing items
        self.list_view.delete(*self.list_view.get_children())
        
        # Calculate current page items to display
        start_index = (self.current_page - 1) * self.page_size
        end_index = min(start_index + self.page_size, len(self.filtered_items))
        
        # Ensure start index is valid
        if start_index >= len(self.filtered_items) and self.current_page > 1:
            self.current_page = max(1, self.current_page - 1)
            start_index = (self.current_page - 1) * self.page_size
            end_index = min(start_index + self.page_size, len(self.filtered_items))
        
        # Current page items
        current_page_items = self.filtered_items[start_index:end_index]
        
        # Add items to list view
        selected_ids = set(str(doc.get('_id')) for doc in self.selected_docs)
        id_to_iid = {}  # 用于存储 _id 到 Treeview item ID 的映射
        
        # 获取当前列配置
        columns = self.list_view["columns"]
        
        for item in current_page_items:
            item_id = str(item.get('_id'))
            # 构建每个字段的值
            values = []
            for col in columns:
                value = item.get(col)
                if isinstance(value, (list, dict)):
                    # 如果是列表或字典，转换为字符串
                    value = str(value)
                elif value is None:
                    value = ""
                values.append(str(value))
            
            # 插入项目并获取 Treeview 生成的 item ID
            iid = self.list_view.insert('', 'end', values=values)
            id_to_iid[item_id] = iid
            
            # 如果该项目应该被选中，使用 Treeview 的 item ID 来选中
            if item_id in selected_ids:
                try:
                    self.list_view.selection_add(iid)
                except Exception as e:
                    print(f"Selection error for item {item_id}: {e}")
        
        # 更新 _on_list_selection_changed 方法中使用的映射
        self._id_to_iid_map = id_to_iid
        
        # Update pagination controls
        self._update_pagination_controls()
        self._update_select_all_btn()
        self._update_status_bar()
    
    def _on_card_selected(self, card, is_selected, event=None):
        try:
            idx = self.displayed_cards.index(card)
            if self.selection_mode == "single":
                for c in self.displayed_cards:
                    c.set_selected(False)
                card.set_selected(True)
                self.last_selected_index = idx if card.is_selected else None
            else:
                shift_pressed = False
                ctrl_pressed = False
                if event:
                    shift_pressed = (event.state & 0x0001) != 0
                    ctrl_pressed = (event.state & 0x0004) != 0
                if shift_pressed and self.last_selected_index is not None:
                    start = min(self.last_selected_index, idx)
                    end = max(self.last_selected_index, idx)
                    for i in range(start, end + 1):
                        self.displayed_cards[i].set_selected(True)
                elif ctrl_pressed:
                    card.set_selected(not card.is_selected)
                    self.last_selected_index = idx if card.is_selected else self.last_selected_index
                else:
                    for c in self.displayed_cards:
                        c.set_selected(False)
                    card.set_selected(True)
                    self.last_selected_index = idx if card.is_selected else None
        except Exception as e:
            print(f"Selection error: {e}")
        self._update_selection_ui()
        try:
            if self.on_show_details:
                self.on_show_details(card.doc)
        except Exception as e:
            print(f"Auto show details error: {e}")
    
    def _update_selection_ui(self):
        """Update selection state related UI（避免多余重绘）"""
        self.selected_docs = [card.doc for card in self.displayed_cards if card.is_selected]
        has_selection = len(self.selected_docs) > 0
        for i in range(1, len(self.operations_frame.winfo_children())):
            self.operations_frame.winfo_children()[i].configure(state="normal" if has_selection else "disabled")
        self._update_status_bar()
        self._update_select_all_btn()
    
    def _toggle_select_all(self):
        """全选/全不选当前页"""
        if self.current_view == "grid":
            # 网格视图模式
            all_selected = all(card.is_selected for card in self.displayed_cards) and len(self.displayed_cards) > 0
            # 暂时禁用卡片的回调，批量设置后再统一刷新
            for card in self.displayed_cards:
                card.on_select_callback = None
            if all_selected:
                for card in self.displayed_cards:
                    card.set_selected(False)
            else:
                for card in self.displayed_cards:
                    card.set_selected(True)
            # 恢复回调
            for card in self.displayed_cards:
                card.on_select_callback = self._on_card_selected
        else:
            # 列表视图模式
            all_items = self.list_view.get_children()
            if not all_items:
                return
            
            # 检查是否全部选中
            all_selected = len(self.list_view.selection()) == len(all_items)
            
            if all_selected:
                # 如果全部选中，则取消全选
                self.list_view.selection_remove(*all_items)
            else:
                # 如果未全选，则全选
                self.list_view.selection_set(*all_items)
            
            # 触发选择变更事件来更新状态
            self._on_list_selection_changed()
        
        # 更新UI状态
        self._update_selection_ui()
        self._update_select_all_btn()
    
    def _bulk_export(self):
        """Bulk export selected documents"""
        if self.context_menu_callback:
            self.context_menu_callback("bulk_export", self.selected_docs)
    
    def _bulk_create_relation(self):
        """Create relation for selected documents"""
        if self.context_menu_callback:
            self.context_menu_callback("bulk_relate", self.selected_docs)
    
    def _on_frame_configure(self, event):
        """处理内部frame大小变化"""
        # 更新canvas的滚动区域
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        # 自动调整列数
        self._auto_adjust_columns()
    
    def _on_canvas_configure(self, event):
        """处理canvas大小变化"""
        # 更新内部frame的宽度以匹配canvas
        self.canvas.itemconfig(self.canvas_window, width=event.width)
        # 重新计算滚动区域
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))
    
    def _on_mouse_wheel(self, event):
        """Handle mouse wheel event"""
        if self.current_view == "grid":
            # Scroll grid view
            self.canvas.yview_scroll(-1 * (event.delta // 120), "units")
        else:
            # Scroll list view
            self.list_view.yview_scroll(-1 * (event.delta // 120), "units")
    
    def bind_mousewheel(self):
        """Bind mouse wheel event (when mouse hovers over component)"""
        self.canvas.bind_all("<MouseWheel>", self._on_mouse_wheel)  # Windows
        self.canvas.bind_all("<Button-4>", self._on_linux_scroll)   # Linux scroll up
        self.canvas.bind_all("<Button-5>", self._on_linux_scroll)   # Linux scroll down
    
    def unbind_mousewheel(self):
        """Unbind mouse wheel event (when mouse leaves component)"""
        self.canvas.unbind_all("<MouseWheel>")
        self.canvas.unbind_all("<Button-4>")
        self.canvas.unbind_all("<Button-5>")
    
    def _on_mouse_down(self, event):
        """Handle mouse press event"""
        self.drag_start_x = self.canvas.canvasx(event.x)
        self.drag_start_y = self.canvas.canvasy(event.y)
        self.is_dragging = True
        
        # If Ctrl or Shift keys are not pressed, cancel previous selection
        if not (self.ctrl_pressed or self.shift_pressed):
            for card in self.displayed_cards:
                card.set_selected(False)
    
    def _on_mouse_drag(self, event):
        """Handle mouse drag event"""
        if self.is_dragging:
            # Get current mouse position
            current_x = self.canvas.canvasx(event.x)
            current_y = self.canvas.canvasy(event.y)
            
            # If selection rectangle exists, delete it
            if self.selection_rect:
                self.canvas.delete(self.selection_rect)
            
            # Create new selection rectangle
            self.selection_rect = self.canvas.create_rectangle(
                self.drag_start_x, self.drag_start_y, current_x, current_y,
                outline="red", width=2, dash=(4, 4)
            )
    
    def _on_mouse_release(self, event):
        """Handle mouse release event"""
        if self.is_dragging and self.selection_rect:
            # Get rectangle coordinates
            x1, y1, x2, y2 = self.canvas.coords(self.selection_rect)
            
            # Correct rectangle coordinates (ensure left top and right bottom are correctly defined)
            x_min = min(x1, x2)
            y_min = min(y1, y2)
            x_max = max(x1, x2)
            y_max = max(y1, y2)
            
            # Select cards in rectangle
            self._select_cards_in_rectangle(x_min, y_min, x_max, y_max)
            
            # Delete selection rectangle
            self.canvas.delete(self.selection_rect)
            self.selection_rect = None
            
            # Update UI
            self._update_selection_ui()
        
        # Reset drag state
        self.is_dragging = False
    
    def _select_cards_in_rectangle(self, x1, y1, x2, y2):
        """Select cards in rectangle area
        
        Args:
            x1: Left top corner X coordinate
            y1: Left top corner Y coordinate
            x2: Right bottom corner X coordinate
            y2: Right bottom corner Y coordinate
        """
        for card in self.displayed_cards:
            # Get card position and size
            try:
                card_x = card.winfo_rootx() - self.canvas.winfo_rootx() + self.canvas.canvasx(0)
                card_y = card.winfo_rooty() - self.canvas.winfo_rooty() + self.canvas.canvasy(0)
                card_width = card.winfo_width()
                card_height = card.winfo_height()
                
                # Card right bottom corner coordinates
                card_right = card_x + card_width
                card_bottom = card_y + card_height
                
                # Check if card is in selection rectangle
                if (card_x < x2 and card_right > x1 and
                    card_y < y2 and card_bottom > y1):
                    
                    if self.ctrl_pressed:
                        # Toggle selection state when Ctrl key is pressed
                        card.set_selected(not card.is_selected)
                    else:
                        # Otherwise set as selected
                        card.set_selected(True)
            except:
                # Ignore destroyed cards
                pass
    
    def next_page(self):
        """Next page"""
        if self.current_page < self.total_pages:
            self.current_page += 1
            if self.current_view == "grid":
                self.refresh_grid()
            else:
                self.refresh_list()
    
    def prev_page(self):
        """Previous page"""
        if self.current_page > 1:
            self.current_page -= 1
            if self.current_view == "grid":
                self.refresh_grid()
            else:
                self.refresh_list()
    
    def _update_pagination_controls(self):
        """Update pagination controls"""
        # Calculate total pages
        self.total_pages = math.ceil(len(self.filtered_items) / self.page_size)
        if self.total_pages == 0:
            self.total_pages = 1
            
        # Update page information
        self.page_info.configure(text=f"Page {self.current_page} of {self.total_pages}")
        
        # Update button states
        self.prev_button.configure(state="normal" if self.current_page > 1 else "disabled")
        self.next_button.configure(state="normal" if self.current_page < self.total_pages else "disabled")
    
    def _on_page_size_changed(self, event):
        try:
            value = self.page_size_var.get()
            if value == "All":
                self.page_size = len(self.filtered_items) if self.filtered_items else len(self.all_items)
            else:
                new_size = int(value)
                if new_size != self.page_size and new_size > 0:
                    self.page_size = new_size
            self.current_page = 1
            if self.current_view == "grid":
                self.refresh_grid()
            else:
                self.refresh_list()
        except Exception:
            self.page_size_var.set(str(self.page_size))
    
    def _on_search(self, event=None):
        """Handle search event"""
        query = self.search_var.get().strip()
        if query:
            # Add search term to history
            if query not in self.search_history:
                self.search_history.append(query)
                # Limit history size
                if len(self.search_history) > 10:
                    self.search_history.pop(0)
            
            # Filter items
            self.filtered_items = self._filter_items(query)
            self.current_page = 1  # Reset to first page
            
            # Refresh view
            if self.current_view == "grid":
                self.refresh_grid()
            else:
                self.refresh_list()
    
    def _clear_search(self):
        """Clear search"""
        self.search_var.set("")
        # Clear filter, show all items
        self.filtered_items = self.all_items[:]
        self.current_page = 1  # Reset to first page
        
        # Refresh view
        if self.current_view == "grid":
            self.refresh_grid()
        else:
            self.refresh_list()
    
    def _filter_items(self, query):
        """Filter items based on query (fuzzy match with rapidfuzz)"""
        query = query.lower()
        filtered = []
        scored = []
        for item in self.all_items:
            max_score = 0
            # Check filename
            filename = str(item.get('filename', '')).lower()
            score = fuzz.partial_ratio(query, filename)
            max_score = max(max_score, score)
            # Check title
            title = str(item.get('title', '')).lower()
            score = fuzz.partial_ratio(query, title)
            max_score = max(max_score, score)
            # Check metadata
            if 'metadata' in item and isinstance(item['metadata'], dict):
                for key, value in item['metadata'].items():
                    score1 = fuzz.partial_ratio(query, str(key).lower())
                    score2 = fuzz.partial_ratio(query, str(value).lower())
                    max_score = max(max_score, score1, score2)
            # Check art movement
            art_movement = str(item.get('artMovement', '')).lower()
            score = fuzz.partial_ratio(query, art_movement)
            max_score = max(max_score, score)
            # Check all direct fields
            for key, value in item.items():
                if isinstance(value, (str, int, float)):
                    score = fuzz.partial_ratio(query, str(value).lower())
                    max_score = max(max_score, score)
            # 命中阈值70
            if max_score >= 70:
                scored.append((item, max_score))
        # 按相似度降序排序
        scored.sort(key=lambda x: -x[1])
        filtered = [x[0] for x in scored]
        return filtered
    
    def _show_search_history(self):
        """Show search history"""
        if not self.search_history:
            messagebox.showinfo("Search History", "No search history")
            return
            
        # Create history menu
        history_menu = Menu(self, tearoff=0)
        
        # Add history items
        for query in reversed(self.search_history):
            # Create a closure function to correctly capture each query
            def make_command(q=query):
                return lambda: self._use_history_item(q)
            
            history_menu.add_command(label=query, command=make_command())
        
        # Add clear history option
        history_menu.add_separator()
        history_menu.add_command(label="Clear History", command=self._clear_search_history)
        
        # Show menu
        try:
            x = self.history_button.winfo_rootx()
            y = self.history_button.winfo_rooty() + self.history_button.winfo_height()
            history_menu.tk_popup(x, y)
        finally:
            history_menu.grab_release()
    
    def _clear_search_history(self):
        """Clear search history"""
        self.search_history = []
        messagebox.showinfo("Search History", "Search history cleared")
    
    def _use_history_item(self, query):
        """Use search item from history
        
        Args:
            query (str): Search query to use
        """
        self.search_var.set(query)
        self._on_search()
    
    def _on_search_text_changed(self, *args):
        """Handle search text change event"""
        # 实时搜索：只要有内容就自动搜索，无需回车
        if not self.search_var.get().strip():
            self._clear_search()
        else:
            self._on_search()
    
    def set_items(self, items):
        """Set items to display
        
        Args:
            items (list): Items list
        """
        try:
            print(f"Setting {len(items) if items else 0} items")
            if items:
                print(f"Sample item: {items[0]}")
            
            self.all_items = items or []
            self._sort_items()  # 新增：每次设置数据时先排序
            self.filtered_items = self.all_items[:]
            self._sort_items()  # 新增：filtered_items也排序
            self.current_page = 1
            
            if self.current_view == "grid":
                self.refresh_grid()
            else:
                self.refresh_list()
            
            self._update_status_bar()
            
        except Exception as e:
            print(f"Error in set_items: {e}")
            import traceback
            traceback.print_exc()
    
    def set_columns(self, columns):
        """Set grid column count
        
        Args:
            columns (int): Column count
        """
        self.columns = columns
        if self.current_view == "grid":
            self.refresh_grid()
    
    # --- Sorting related methods ---
    def _sort_items(self):
        field = self.sort_field_var.get()
        reverse = self.sort_reverse
        def get_key(item):
            if field == "filename":
                return str(item.get("filename") or item.get("title") or "").lower()
            elif field == "importedAt":
                value = item.get("importedAt")
                import datetime
                if isinstance(value, datetime.datetime):
                    return value.timestamp()
                elif isinstance(value, str):
                    try:
                        from dateutil import parser
                        return parser.parse(value).timestamp()
                    except Exception:
                        return float('-inf') if not reverse else float('inf')
                else:
                    return float('-inf') if not reverse else float('inf')
            elif field == "size":
                return item.get("size") or 0
            elif field == "artMovement":
                return str(item.get("artMovement") or "").lower()
            return ""
        self.all_items.sort(key=get_key, reverse=reverse)
        self.filtered_items.sort(key=get_key, reverse=reverse)

    def _on_sort_changed(self, event=None):
        self._sort_items()
        if self.current_view == "grid":
            self.refresh_grid()
        else:
            self.refresh_list()
        self._update_sort_buttons()

    def _set_sort_order(self, reverse):
        self.sort_reverse = reverse
        self._update_sort_buttons()
        self._sort_items()
        if self.current_view == "grid":
            self.refresh_grid()
        else:
            self.refresh_list()

    def _update_sort_buttons(self):
        # 高亮当前排序方向
        if self.sort_reverse:
            self.asc_button.state(["!pressed"])
            self.desc_button.state(["pressed"])
        else:
            self.asc_button.state(["pressed"])
            self.desc_button.state(["!pressed"])
    # --- End of sorting methods --- 

    def _update_status_bar(self):
        """更新底部状态栏信息"""
        total = len(self.all_items)
        selected = len(self.selected_docs)
        self.status_var.set(f"Total: {total}, Selected: {selected}")

    def _on_columns_changed(self, event=None):
        try:
            new_columns = int(self.columns_var.get())
            if new_columns != self.columns and new_columns > 0:
                self.set_columns(new_columns)
        except Exception:
            pass

    def _auto_adjust_columns(self):
        # 自动根据窗口宽度调整列数
        try:
            min_card_width = 240  # 卡片+间距
            frame_width = self.cards_frame.winfo_width()
            if frame_width > 0:
                new_columns = max(1, frame_width // min_card_width)
                if new_columns != self.columns:
                    self.columns = new_columns
                    if self.current_view == "grid":
                        self.refresh_grid()
        except Exception:
            pass

    def _update_select_all_btn(self):
        """根据当前页选择状态切换按钮文本"""
        all_selected = all(card.is_selected for card in self.displayed_cards) and len(self.displayed_cards) > 0
        if all_selected:
            self.select_all_btn.config(text="Deselect All")
        else:
            self.select_all_btn.config(text="Select All")

    def _toggle_selection_mode(self):
        if self.selection_mode == "multi":
            self.selection_mode = "single"
            self.select_mode_btn.config(text="Switch to Multi Selection")
        else:
            self.selection_mode = "multi"
            self.select_mode_btn.config(text="Switch to Single Selection")
        for card in self.displayed_cards:
            card.set_selected(False)
        self.last_selected_index = None
        self._update_selection_ui()

    def _on_list_selection_changed(self, event=None):
        """处理列表选择变更事件"""
        try:
            # 获取当前选中的 Treeview item IDs
            selected_iids = self.list_view.selection()
            
            # 通过当前页的映射找到对应的文档
            self.selected_docs = []
            current_page_start = (self.current_page - 1) * self.page_size
            current_page_end = min(current_page_start + self.page_size, len(self.filtered_items))
            current_page_items = self.filtered_items[current_page_start:current_page_end]
            
            for item in current_page_items:
                item_id = str(item.get('_id'))
                if item_id in self._id_to_iid_map:
                    iid = self._id_to_iid_map[item_id]
                    if iid in selected_iids:
                        self.selected_docs.append(item)
            
            # 更新文档详情显示
            if self.selected_docs and self.on_show_details:
                try:
                    self.on_show_details(self.selected_docs[0])
                except Exception as e:
                    print(f"Show details error: {e}")
            
            self._update_status_bar()
            self._update_select_all_btn()
            
            # 如果当前是grid模式，也刷新grid同步选中
            if self.current_view == "grid":
                self.refresh_grid()
        except Exception as e:
            print(f"List selection change error: {e}")

    def _show_list_context_menu(self, event):
        """显示列表视图的右键菜单
        
        Args:
            event: 鼠标事件
        """
        # 获取点击位置的行ID
        iid = self.list_view.identify_row(event.y)
        if not iid:
            return
            
        # 如果点击的行没有被选中，则选中它
        if iid not in self.list_view.selection():
            self.list_view.selection_set(iid)
            
        # 获取对应的文档
        selected_docs = self.selected_docs
        if not selected_docs:
            return
            
        # 创建右键菜单
        context_menu = tk.Menu(self, tearoff=0)
        context_menu.add_command(label="Edit Details", command=lambda: self.context_menu_callback("view", selected_docs[0]))
        context_menu.add_command(label="Export", command=lambda: self.context_menu_callback("export", selected_docs[0]))
        context_menu.add_command(label="Create Relationship", command=lambda: self.context_menu_callback("relate", selected_docs[0]))
        context_menu.add_separator()
        
        # 根据是否有多选来决定删除操作传递的参数
        if len(selected_docs) > 1:
            context_menu.add_command(label="Delete Selected", command=lambda: self.context_menu_callback("delete", selected_docs))
        else:
            context_menu.add_command(label="Delete", command=lambda: self.context_menu_callback("delete", selected_docs[0]))
            
        # 显示菜单
        context_menu.post(event.x_root, event.y_root)

    def set_schema(self, schema):
        """设置当前集合的schema
        
        Args:
            schema (dict): JSON Schema
        """
        self.current_schema = schema
        self._update_list_columns()
        if self.current_view == "list":
            self.refresh_list()

    def _update_list_columns(self):
        """根据schema更新列表视图的列"""
        if not self.current_schema or 'properties' not in self.current_schema:
            # 如果没有schema，使用默认列
            columns = ["_id", "filename", "title", "type", "size", "importedAt"]
        else:
            # 使用schema中定义的所有字段
            properties = self.current_schema['properties']
            columns = list(properties.keys())
            
            # 确保重要字段在前面
            for field in ["_id", "filename", "title"]:
                if field in columns:
                    columns.remove(field)
                    columns.insert(0, field)

        # 加载保存的列配置
        self.load_column_config()
        
        # 应用保存的列顺序和显示状态
        if self.column_config:
            # 过滤出要显示的列
            visible_columns = [col for col in columns if self.column_config.get(col, {}).get('visible', True)]
            # 按保存的顺序排序
            ordered_columns = []
            saved_order = {col: idx for idx, col in enumerate(self.column_config.get('order', []))}
            for col in visible_columns:
                if col in saved_order:
                    ordered_columns.append((saved_order[col], col))
                else:
                    ordered_columns.append((len(columns), col))
            ordered_columns.sort()
            columns = [col for _, col in ordered_columns]
        
        # 重新配置列表视图
        self.list_view["columns"] = columns
        
        # 设置列标题和宽度
        for col in columns:
            # 标题首字母大写
            display_name = col.replace('_', ' ').title()
            self.list_view.heading(col, text=display_name)
            
            # 使用保存的宽度或默认宽度
            width = self.column_config.get(col, {}).get('width', None)
            if width is None:
                if col == '_id':
                    width = 250
                elif col in ['description', 'content', 'tags']:
                    width = 200
                elif col in ['filename', 'title', 'filePath']:
                    width = 180
                elif col.endswith('At'):
                    width = 150
                else:
                    width = 120
            
            self.list_view.column(col, width=width)
        
        # 更新排序下拉框的值
        self.sort_field_combo['values'] = columns
        if columns:
            self.sort_field_var.set(columns[0])

    def _on_linux_scroll(self, event):
        """Handle Linux scroll events"""
        if self.current_view == "grid":
            # Scroll grid view
            delta = -1 if event.num == 5 else 1
            self.canvas.yview_scroll(delta, "units")
        else:
            # Scroll list view
            delta = -1 if event.num == 5 else 1
            self.list_view.yview_scroll(delta, "units")

    def _on_list_item_double_click(self, event):
        """处理列表项的双击事件"""
        iid = self.list_view.identify_row(event.y)
        if not iid:
            return
            
        # 获取对应的文档
        for item in self.filtered_items:
            item_id = str(item.get('_id'))
            if item_id in self._id_to_iid_map and self._id_to_iid_map[item_id] == iid:
                if self.on_show_details:
                    try:
                        self.on_show_details(item)
                    except Exception as e:
                        print(f"Show details error on double click: {e}")
                break

    def _on_column_click(self, event):
        """处理列头点击事件"""
        region = self.list_view.identify('region', event.x, event.y)
        if region == "heading":
            column = self.list_view.identify_column(event.x)
            if column:  # column will be like '#1', '#2', etc.
                # 保存拖动开始的列信息
                self._drag_column = column
                self._drag_position = event.x
                # 保存开始拖动的列的所有信息
                col_index = int(column[1]) - 1
                columns = self.list_view["columns"]
                if 0 <= col_index < len(columns):
                    col_name = columns[col_index]
                    self._drag_column_info = {
                        'name': col_name,
                        'width': self.list_view.column(col_name, 'width'),
                        'heading': self.list_view.heading(col_name)
                    }

    def _on_column_drag(self, event):
        """处理列头拖动事件"""
        if self._drag_column:
            # 显示拖动光标
            self.list_view.configure(cursor='exchange')

    def _on_column_drop(self, event):
        """处理列头释放事件"""
        if self._drag_column and hasattr(self, '_drag_column_info'):
            target_column = self.list_view.identify_column(event.x)
            if target_column and target_column != self._drag_column:
                try:
                    # 获取列名而不是列索引
                    columns = list(self.list_view["columns"])
                    from_idx = int(self._drag_column[1]) - 1
                    to_idx = int(target_column[1]) - 1
                    
                    if 0 <= from_idx < len(columns) and 0 <= to_idx < len(columns):
                        # 保存所有列的当前数据
                        items_data = []
                        for item in self.list_view.get_children():
                            values = {}
                            for col in columns:
                                values[col] = self.list_view.set(item, col)
                            items_data.append(values)
                        
                        # 重新排序列
                        col = columns.pop(from_idx)
                        columns.insert(to_idx, col)
                        
                        # 更新列顺序
                        self.list_view["columns"] = columns
                        
                        # 重新设置列标题和属性
                        for col in columns:
                            # 设置列标题
                            display_name = col.replace('_', ' ').title()
                            self.list_view.heading(col, text=display_name)
                            
                            # 设置列宽度（使用保存的配置或默认值）
                            width = self.column_config.get(col, {}).get('width')
                            if width:
                                self.list_view.column(col, width=width)
                        
                        # 重新填充数据
                        self.list_view.delete(*self.list_view.get_children())
                        for item_data in items_data:
                            values = []
                            for col in columns:
                                values.append(item_data.get(col, ''))
                            self.list_view.insert('', 'end', values=values)
                        
                        # 保存新的列顺序
                        self.column_config['order'] = columns
                        self.save_column_config()
                
                except Exception as e:
                    print(f"Error during column swap: {e}")
                    # 发生错误时刷新显示
                    self._update_list_columns()
            
            # 重置拖动状态
            self._drag_column = None
            self._drag_position = None
            if hasattr(self, '_drag_column_info'):
                del self._drag_column_info
            self.list_view.configure(cursor='')

    def _show_column_settings(self):
        """显示列设置对话框"""
        dialog = tk.Toplevel(self)
        dialog.title("Column Settings")
        dialog.grab_set()
        dialog.transient(self)
        
        # 创建复选框框架
        frame = ttk.Frame(dialog, padding="10")
        frame.pack(fill=tk.BOTH, expand=True)
        
        # 获取所有列
        columns = self.list_view["columns"]
        checkboxes = {}
        
        # 为每个列创建复选框
        for i, col in enumerate(columns):
            var = tk.BooleanVar(value=True)  # 默认显示
            if col in self.column_config:
                var.set(self.column_config[col].get('visible', True))
            
            cb = ttk.Checkbutton(
                frame,
                text=col.replace('_', ' ').title(),
                variable=var,
                command=lambda c=col, v=var: self._toggle_column(c, v.get())
            )
            cb.grid(row=i//2, column=i%2, sticky='w', padx=5, pady=2)
            checkboxes[col] = var
        
        # 按钮框架
        btn_frame = ttk.Frame(dialog)
        btn_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Button(btn_frame, text="Select All", 
                   command=lambda: self._select_all_columns(checkboxes)).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="Deselect All", 
                   command=lambda: self._deselect_all_columns(checkboxes)).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="Close", 
                   command=dialog.destroy).pack(side=tk.RIGHT, padx=5)
        
        # 居中显示对话框
        dialog.update_idletasks()
        width = dialog.winfo_width()
        height = dialog.winfo_height()
        x = (dialog.winfo_screenwidth() // 2) - (width // 2)
        y = (dialog.winfo_screenheight() // 2) - (height // 2)
        dialog.geometry(f'{width}x{height}+{x}+{y}')

    def _toggle_column(self, column, show):
        """切换列的显示状态"""
        if not self.column_config.get(column):
            self.column_config[column] = {}
        self.column_config[column]['visible'] = show
        self.save_column_config()
        self._update_list_columns()

    def _select_all_columns(self, checkboxes):
        """选择所有列"""
        for col, var in checkboxes.items():
            var.set(True)
            self._toggle_column(col, True)

    def _deselect_all_columns(self, checkboxes):
        """取消选择所有列"""
        for col, var in checkboxes.items():
            var.set(False)
            self._toggle_column(col, False)

    def load_column_config(self):
        """加载列配置"""
        try:
            config_file = os.path.join(os.path.dirname(__file__), 'column_config.json')
            if os.path.exists(config_file):
                with open(config_file, 'r', encoding='utf-8') as f:
                    self.column_config = json.load(f)
        except Exception as e:
            print(f"Error loading column config: {e}")
            self.column_config = {}

    def save_column_config(self):
        """保存列配置"""
        try:
            config_file = os.path.join(os.path.dirname(__file__), 'column_config.json')
            # 保存列宽度
            for col in self.list_view["columns"]:
                if col not in self.column_config:
                    self.column_config[col] = {}
                self.column_config[col]['width'] = self.list_view.column(col, 'width')
            
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(self.column_config, f, indent=2)
        except Exception as e:
            print(f"Error saving column config: {e}")