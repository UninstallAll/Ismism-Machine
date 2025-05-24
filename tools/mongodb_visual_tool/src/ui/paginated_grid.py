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
        if self.selection_mode == "multi":
            for card in self.displayed_cards:
                card.set_selected(True)
            self._update_selection_ui()
        return "break"
    
    def _deselect_all_shortcut(self, event):
        if self.selection_mode == "multi":
            for card in self.displayed_cards:
                card.set_selected(False)
            self._update_selection_ui()
        return "break"
    
    def _invert_selection_shortcut(self, event):
        if self.selection_mode == "multi":
            for card in self.displayed_cards:
                card.set_selected(not card.is_selected)
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
        
        columns = ("Filename", "Type", "Size")
        self.list_view = ttk.Treeview(self.list_frame, columns=columns, show="headings", selectmode="extended")
        
        for col in columns:
            self.list_view.heading(col, text=col)
            self.list_view.column(col, width=100)
        
        vsb = ttk.Scrollbar(self.list_frame, orient="vertical", command=self.list_view.yview)
        hsb = ttk.Scrollbar(self.list_frame, orient="horizontal", command=self.list_view.xview)
        self.list_view.configure(yscrollcommand=vsb.set, xscrollcommand=hsb.set)
        
        vsb.pack(side=tk.RIGHT, fill=tk.Y)
        hsb.pack(side=tk.BOTTOM, fill=tk.X)
        self.list_view.pack(fill=tk.BOTH, expand=True)
        self.list_view.bind("<<TreeviewSelect>>", self._on_list_selection_changed)
        self.list_view.bind("<Button-3>", self._show_list_context_menu)  # Bind right-click menu event
        
        # Grid view - Canvas + Frame
        self.grid_frame = ttk.Frame(self.view_container)
        
        # Use canvas to support scrolling
        self.canvas = tk.Canvas(self.grid_frame, borderwidth=0, highlightthickness=0)
        self.scrollbar = ttk.Scrollbar(self.grid_frame, orient=tk.VERTICAL, command=self.canvas.yview)
        self.canvas.configure(yscrollcommand=self.scrollbar.set)
        
        self.scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # Inner frame for placing cards
        self.cards_frame = ttk.Frame(self.canvas)
        self.canvas_window = self.canvas.create_window((0, 0), window=self.cards_frame, anchor=tk.NW)
        
        # Set grid view as default
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
        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)  # Windows
        self.canvas.bind_all("<Button-4>", self._on_mousewheel)    # Linux scroll up
        self.canvas.bind_all("<Button-5>", self._on_mousewheel)    # Linux scroll down
        
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
        if self.current_view == "grid":
            self.current_view = "list"
            self.grid_frame.pack_forget()
            self.list_frame.pack(fill=tk.BOTH, expand=True)
            self.refresh_list()
        else:
            self.current_view = "grid"
            self.list_frame.pack_forget()
            self.grid_frame.pack(fill=tk.BOTH, expand=True)
            self.refresh_grid()
    
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
        # 避免UI已销毁时更新
        if not card or not card.winfo_exists():
            return
        # 这里可以做图片加载完成后的UI刷新（如需要）
        pass
    
    def refresh_grid(self):
        """Refresh grid view (重写选择逻辑，完全复刻list模式)"""
        self.image_loader.clear_queue()
        for card in self.displayed_cards:
            card.destroy()
        self.displayed_cards = []

        start_index = (self.current_page - 1) * self.page_size
        end_index = min(start_index + self.page_size, len(self.filtered_items))
        if start_index >= len(self.filtered_items) and self.current_page > 1:
            self.current_page = max(1, self.current_page - 1)
            start_index = (self.current_page - 1) * self.page_size
            end_index = min(start_index + self.page_size, len(self.filtered_items))
        current_page_items = self.filtered_items[start_index:end_index]

        row = 0
        col = 0
        selected_ids = set(str(doc.get('_id')) for doc in self.selected_docs)
        for item in current_page_items:
            card = ImageCard(self.cards_frame, item)
            card.grid(row=row, column=col, padx=5, pady=5, sticky="nsew")
            card.bind_select_callback(self._on_card_selected)
            if self.context_menu_callback:
                card.setup_context_menu(self.context_menu_callback)
            # 同步选中状态
            if str(item.get('_id')) in selected_ids:
                card.set_selected(True)
            self.displayed_cards.append(card)
            self.image_loader.add_task(card)
            col += 1
            if col >= self.columns:
                col = 0
                row += 1

        # 绑定卡片点击事件，完全复刻list模式的多选逻辑
        for idx, card in enumerate(self.displayed_cards):
            def make_on_click(c, i):
                def _on_click(event):
                    if self.selection_mode == "single":
                        for cc in self.displayed_cards:
                            cc.set_selected(False)
                        c.set_selected(True)
                        self.last_selected_index = i if c.is_selected else None
                    else:
                        shift_pressed = (event.state & 0x0001) != 0
                        ctrl_pressed = (event.state & 0x0004) != 0
                        if shift_pressed and self.last_selected_index is not None:
                            start = min(self.last_selected_index, i)
                            end = max(self.last_selected_index, i)
                            for j in range(start, end + 1):
                                self.displayed_cards[j].set_selected(True)
                        elif ctrl_pressed:
                            c.set_selected(not c.is_selected)
                            self.last_selected_index = i if c.is_selected else self.last_selected_index
                        else:
                            for cc in self.displayed_cards:
                                cc.set_selected(False)
                            c.set_selected(True)
                            self.last_selected_index = i if c.is_selected else None
                    self._update_selection_ui()
                    if self.on_show_details:
                        try:
                            self.on_show_details(c.doc)
                        except Exception as e:
                            print(f"Auto show details error: {e}")
                return _on_click
            card.bind("<Button-1>", make_on_click(card, idx))

        self._update_pagination_controls()
        self._update_select_all_btn()
    
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
        for item in current_page_items:
            if not self.current_schema:
                # 使用默认显示方式
                filename = item.get('filename', 'Unknown')
                filetype = os.path.splitext(filename)[1] if 'filename' in item else 'Unknown'
                size = f"{int(item.get('size', 0) / 1024)} KB" if 'size' in item else 'Unknown'
                values = (filename, filetype, size)
            else:
                # 根据schema显示字段
                values = []
                for field in self.list_view["columns"]:
                    field_name = field.lower()
                    field_value = item.get(field_name, '')
                    if isinstance(field_value, (list, dict)):
                        field_value = str(field_value)
                    values.append(field_value or 'Unknown')
            
            row_id = self.list_view.insert("", "end", text=str(item.get('_id', '')), values=values)
            # 同步选中状态
            if str(item.get('_id')) in selected_ids:
                self.list_view.selection_add(row_id)
        
        # Update pagination controls
        self._update_pagination_controls()
        self._update_select_all_btn()  # 新增：刷新全选按钮
    
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
        """全选/全不选当前页（批量静默更新，避免闪烁）"""
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
        """Handle internal frame resize event"""
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        self._auto_adjust_columns()
    
    def _on_canvas_configure(self, event):
        """Handle canvas resize event"""
        # Update internal frame width to match canvas
        self.canvas.itemconfig(self.canvas_window, width=event.width)
    
    def _on_mousewheel(self, event):
        print("Mouse wheel event:", event)
        delta = -1 * (event.delta // 120) if hasattr(event, 'delta') else 1 if event.num == 5 else -1
        self.canvas.yview_scroll(delta, "units")
    
    def bind_mousewheel(self):
        """Bind mouse wheel event (when mouse hovers over component)"""
        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)  # Windows
        self.canvas.bind_all("<Button-4>", self._on_mousewheel)    # Linux scroll up
        self.canvas.bind_all("<Button-5>", self._on_mousewheel)    # Linux scroll down
    
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
        self.all_items = items or []
        self._sort_items()  # 新增：每次设置数据时先排序
        self.filtered_items = self.all_items[:]
        self._sort_items()  # 新增：filtered_items也排序
        self.current_page = 1
        if self.current_view == "grid":
            self.refresh_grid()
        else:
            self.refresh_list()
        self._update_status_bar()  # 新增：刷新状态栏
    
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
        # 只要列表选择变更，selected_docs就同步
        selected_ids = set(self.list_view.item(i, 'text') for i in self.list_view.selection())
        # 用_id查找doc
        self.selected_docs = [item for item in self.filtered_items if str(item.get('_id')) in selected_ids]
        self._update_status_bar()
        self._update_select_all_btn()
        # 如果当前是grid模式，也刷新grid同步选中
        if self.current_view == "grid":
            self.refresh_grid()

    def _show_list_context_menu(self, event):
        """显示列表视图的右键菜单
        
        Args:
            event: 鼠标事件
        """
        # 获取点击位置的行ID
        row_id = self.list_view.identify_row(event.y)
        if not row_id:
            return
            
        # 如果点击的行没有被选中，则选中它
        if row_id not in self.list_view.selection():
            self.list_view.selection_set(row_id)
            
        # 获取对应的文档
        doc_id = self.list_view.item(row_id, 'text')
        doc = next((d for d in self.filtered_items if str(d.get('_id')) == doc_id), None)
        
        if not doc:
            return
            
        # 创建右键菜单
        context_menu = tk.Menu(self, tearoff=0)
        context_menu.add_command(label="Edit Details", command=lambda: self.context_menu_callback("view", doc))
        context_menu.add_command(label="Export", command=lambda: self.context_menu_callback("export", doc))
        context_menu.add_command(label="Create Relationship", command=lambda: self.context_menu_callback("relate", doc))
        context_menu.add_separator()
        
        # 根据是否有多选来决定删除操作传递的参数
        if len(self.selected_docs) > 0:
            context_menu.add_command(label="Delete", command=lambda: self.context_menu_callback("delete", self.selected_docs))
        else:
            context_menu.add_command(label="Delete", command=lambda: self.context_menu_callback("delete", doc))
            
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
        if not self.current_schema:
            # 默认列
            columns = ("Filename", "Type", "Size")
        else:
            # 从schema中获取字段
            properties = self.current_schema.get('properties', {})
            columns = []
            for field, schema in properties.items():
                # 跳过ObjectId类型的字段和数组字段
                field_type = schema.get('bsonType')
                if isinstance(field_type, list):
                    field_type = [t for t in field_type if t != 'null'][0] if [t for t in field_type if t != 'null'] else None
                if field_type not in ['objectId', 'array']:
                    columns.append(field.capitalize())
            if not columns:
                columns = ["ID"]

        # 重新配置列表视图
        self.list_view["columns"] = columns
        for col in columns:
            self.list_view.heading(col, text=col)
            self.list_view.column(col, width=100)

        # 更新排序下拉框的值
        if self.current_schema:
            sort_fields = [field for field, schema in self.current_schema.get('properties', {}).items()
                         if schema.get('bsonType') not in ['objectId', 'array']]
            self.sort_field_combo['values'] = sort_fields
            if sort_fields:
                self.sort_field_var.set(sort_fields[0])