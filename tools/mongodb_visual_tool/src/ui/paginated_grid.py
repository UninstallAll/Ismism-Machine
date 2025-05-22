#!/usr/bin/env python3
"""
Paginated Grid Component - For displaying paginated image cards
"""
import tkinter as tk
from tkinter import ttk, Menu, messagebox
import math
import os
from PIL import Image, ImageTk

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
        self.page_size = 50  # 默认每页50个
        self.columns = 3     # 初始列数，后续自动调整
        self.current_page = 1
        self.total_pages = 1
        self.all_items = []  # All items
        self.filtered_items = []  # Filtered items
        self.displayed_cards = []  # Currently displayed cards
        self.selected_docs = []  # Selected documents
        self.context_menu_callback = None
        self.current_view = "grid"  # Default view mode (grid or list)
        self.on_show_details = on_show_details
        
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
        
        # 排序相关属性
        self.sort_field = "filename"
        self.sort_reverse = False
        
        # Last selected index
        self.last_selected_index = None
        
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
        """Handle select all shortcut"""
        for card in self.displayed_cards:
            card.set_selected(True)
        self._update_selection_ui()
        return "break"  # Prevent event propagation
    
    def _deselect_all_shortcut(self, event):
        """Handle deselect all shortcut"""
        for card in self.displayed_cards:
            card.set_selected(False)
        self._update_selection_ui()
        return "break"
    
    def _invert_selection_shortcut(self, event):
        """Handle invert selection shortcut"""
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
        
        # --- 新增：排序控件 ---
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
        # --- 新增：双排序按钮 ---
        self.asc_button = ttk.Button(self.toolbar, text="↑", width=2, command=lambda: self._set_sort_order(False))
        self.desc_button = ttk.Button(self.toolbar, text="↓", width=2, command=lambda: self._set_sort_order(True))
        self.asc_button.pack(side=tk.LEFT, padx=0)
        self.desc_button.pack(side=tk.LEFT, padx=(0, 8))
        self._update_sort_buttons()
        # --- 排序控件结束 ---
        
        # Bulk operations buttons
        self.operations_frame = ttk.Frame(self.toolbar)
        self.operations_frame.pack(side=tk.RIGHT)
        self.select_all_btn = ttk.Button(self.operations_frame, text="全选", command=self._toggle_select_all)
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
        self.canvas.bind("<MouseWheel>", self._on_mousewheel)  # Windows
        self.canvas.bind("<Button-4>", self._on_mousewheel)    # Linux scroll up
        self.canvas.bind("<Button-5>", self._on_mousewheel)    # Linux scroll down
        
        # Bind mouse drag events
        self.canvas.bind("<ButtonPress-1>", self._on_mouse_down)
        self.canvas.bind("<B1-Motion>", self._on_mouse_drag)
        self.canvas.bind("<ButtonRelease-1>", self._on_mouse_release)
        
        # --- 新增：底部状态栏 ---
        self.status_frame = ttk.Frame(self.main_frame)
        self.status_frame.pack(fill=tk.X, padx=5, pady=(0, 5), side=tk.BOTTOM)
        self.status_var = tk.StringVar(value="Total: 0, Selected: 0")
        self.status_label = ttk.Label(self.status_frame, textvariable=self.status_var, anchor="w")
        self.status_label.pack(side=tk.LEFT, fill=tk.X, expand=True)
        # --- 新增：列数设置控件 ---
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
        # --- 状态栏结束 ---
        # --- 新增：快捷键说明栏 ---
        self.shortcut_frame = ttk.Frame(self.main_frame)
        self.shortcut_frame.pack(fill=tk.X, padx=5, pady=(0, 0), side=tk.BOTTOM)
        shortcut_text = (
            "快捷键： Ctrl+A 全选   Ctrl+D 全不选   Ctrl+I 反选   Shift+点击 连续多选   Ctrl+点击 断续多选"
        )
        self.shortcut_label = ttk.Label(self.shortcut_frame, text=shortcut_text, anchor="w", foreground="#666666")
        self.shortcut_label.pack(fill=tk.X)
        # --- 说明栏结束 ---
    
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
        """Refresh grid view"""
        # 清空旧的图片加载队列，避免无效任务堆积
        self.image_loader.clear_queue()
        # Clear existing cards
        for card in self.displayed_cards:
            card.destroy()
        self.displayed_cards = []
        
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
        
        # Create cards and layout
        row = 0
        col = 0
        for item in current_page_items:
            # Create card
            card = ImageCard(self.cards_frame, item)
            card.grid(row=row, column=col, padx=5, pady=5, sticky="nsew")
            card.bind_select_callback(self._on_card_selected)
            
            # Set context menu
            if self.context_menu_callback:
                card.setup_context_menu(self.context_menu_callback)
            
            # Add to displayed cards list
            self.displayed_cards.append(card)
            
            # Asynchronously load image
            self.image_loader.add_task(card)
            
            # Update row and column
            col += 1
            if col >= self.columns:
                col = 0
                row += 1
        
        # Update pagination controls
        self._update_pagination_controls()
        self._update_select_all_btn()  # 新增：刷新全选按钮
    
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
        for item in current_page_items:
            # Get data
            filename = item.get('filename', 'Unknown')
            filetype = os.path.splitext(filename)[1] if 'filename' in item else 'Unknown'
            size = f"{int(item.get('size', 0) / 1024)} KB" if 'size' in item else 'Unknown'
            
            # Insert item into list view
            self.list_view.insert("", "end", text=str(item.get('_id', '')), 
                                values=(filename, filetype, size))
        
        # Update pagination controls
        self._update_pagination_controls()
        self._update_select_all_btn()  # 新增：刷新全选按钮
    
    def _on_card_selected(self, card, is_selected, event=None):
        """Handle card selection state change
        
        Args:
            card: Image card object
            is_selected (bool): Whether it's selected
            event: Mouse event
        """
        try:
            idx = self.displayed_cards.index(card)
            shift_pressed = False
            ctrl_pressed = False
            if event:
                shift_pressed = (event.state & 0x0001) != 0
                ctrl_pressed = (event.state & 0x0004) != 0
            selected_count = sum(1 for c in self.displayed_cards if c.is_selected)
            if (not shift_pressed and not ctrl_pressed and selected_count > 1):
                pass
            elif shift_pressed and self.last_selected_index is not None:
                start = min(self.last_selected_index, idx)
                end = max(self.last_selected_index, idx)
                for i in range(start, end + 1):
                    self.displayed_cards[i].set_selected(True)
            elif ctrl_pressed:
                pass
            else:
                for c in self.displayed_cards:
                    if c != card:
                        c.set_selected(False)
            self.last_selected_index = idx
        except Exception as e:
            print(f"Selection error: {e}")
        self._update_selection_ui()
        # 新增：点击卡片时自动显示详情
        try:
            if self.on_show_details:
                self.on_show_details(card.doc)
        except Exception as e:
            print(f"Auto show details error: {e}")
    
    def _update_selection_ui(self):
        """Update selection state related UI"""
        # Get selected documents
        self.selected_docs = []
        for card in self.displayed_cards:
            if card.is_selected:
                self.selected_docs.append(card.doc)
        
        # Update bulk operation buttons state
        has_selection = len(self.selected_docs) > 0
        for i in range(1, len(self.operations_frame.winfo_children())):  # Skip select all button
            if has_selection:
                self.operations_frame.winfo_children()[i].configure(state="normal")
            else:
                self.operations_frame.winfo_children()[i].configure(state="disabled")
        self._update_status_bar()  # 新增：刷新状态栏
        self._update_select_all_btn()  # 新增：刷新全选按钮
    
    def _toggle_select_all(self):
        """全选/全不选当前页"""
        # 判断当前页是否已全选
        all_selected = all(card.is_selected for card in self.displayed_cards) and len(self.displayed_cards) > 0
        if all_selected:
            for card in self.displayed_cards:
                card.set_selected(False)
        else:
            for card in self.displayed_cards:
                card.set_selected(True)
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
        """Handle mouse wheel event"""
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
        """Filter items based on query
        
        Args:
            query (str): Search query
        
        Returns:
            list: Filtered items list
        """
        query = query.lower()
        filtered = []
        
        for item in self.all_items:
            # Search multiple fields
            found = False
            
            # Check filename
            filename = str(item.get('filename', '')).lower()
            if query in filename:
                found = True
                
            # Check title
            title = str(item.get('title', '')).lower()
            if query in title:
                found = True
                
            # Check metadata
            if 'metadata' in item and isinstance(item['metadata'], dict):
                for key, value in item['metadata'].items():
                    if query in str(key).lower() or query in str(value).lower():
                        found = True
                        break
                        
            # Check art movement
            art_movement = str(item.get('artMovement', '')).lower()
            if query in art_movement:
                found = True
                
            # If match found in metadata direct fields
            for key, value in item.items():
                if isinstance(value, (str, int, float)) and query in str(value).lower():
                    found = True
                    break
            
            # Add matched item
            if found:
                filtered.append(item)
        
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
        # If search box is empty, clear search results
        if not self.search_var.get().strip():
            self._clear_search()
    
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
    
    # --- 新增：排序相关方法 ---
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
    # --- 排序相关方法结束 --- 

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
            self.select_all_btn.config(text="全不选")
        else:
            self.select_all_btn.config(text="全选")