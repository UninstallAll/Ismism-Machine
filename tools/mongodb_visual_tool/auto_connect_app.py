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

class ImageCard(ttk.Frame):
    """A component to display an image with its metadata"""
    def __init__(self, parent, doc=None, width=200, height=200, on_select_callback=None):
        super().__init__(parent, borderwidth=1, relief="solid")
        
        self.width = width
        self.height = height
        self.doc = doc or {}
        self.metadata = {}
        self.image_path = None
        self.image = None
        self.is_selected = False
        self.on_select_callback = on_select_callback
        
        # Extract metadata from document
        self._extract_metadata()
        
        # Create image display area
        self.image_frame = ttk.Frame(self, width=width, height=height)
        self.image_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        self.image_frame.pack_propagate(False)  # Prevent frame from shrinking
        
        self.image_label = ttk.Label(self.image_frame, text="Loading...")
        self.image_label.pack(fill=tk.BOTH, expand=True)
        
        # Create metadata display area
        self.meta_frame = ttk.Frame(self)
        self.meta_frame.pack(fill=tk.X, padx=5, pady=5)
        
        # Create selection checkbox
        self.select_var = tk.BooleanVar(value=False)
        self.select_checkbox = ttk.Checkbutton(self.meta_frame, variable=self.select_var, 
                                             command=self._on_checkbox_toggle)
        self.select_checkbox.pack(side=tk.LEFT)
        
        # Display filename or title
        name = self.metadata.get('filename', "Unnamed")
        self.name_label = ttk.Label(self.meta_frame, text=name, wraplength=width-40)
        self.name_label.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # Add size info if available (move to a new line for layout)
        info_frame = ttk.Frame(self)
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
        # 切换选中状态
        self.select_var.set(not self.select_var.get())
        self._on_checkbox_toggle()
        
    def _on_checkbox_toggle(self):
        """处理复选框状态改变"""
        self.is_selected = self.select_var.get()
        # 更新视觉显示
        if self.is_selected:
            self.configure(style="Selected.TFrame")
            self.configure(borderwidth=2, relief="solid")
        else:
            self.configure(style="")
            self.configure(borderwidth=1, relief="solid")
            
        # 调用回调函数通知父组件
        if self.on_select_callback:
            self.on_select_callback(self, self.is_selected)
    
    def set_selected(self, selected):
        """从外部设置选中状态"""
        if selected != self.is_selected:
            self.select_var.set(selected)
            self._on_checkbox_toggle()
    
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
                self.image_label.config(text=f"Image not found")
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
        self.card_width = 250
        self.card_height = 200
        self.columns = DEFAULT_GRID_COLUMNS
        self.context_callback = None
        
        # 存储当前显示的卡片和选中的卡片
        self.cards = []
        self.selected_cards = []
        
        self.image_loader = ImageLoader(self._on_image_loaded)
        
        self._create_ui()
    
    def _create_ui(self):
        # 添加多选操作工具栏
        self.toolbar_frame = ttk.Frame(self)
        self.toolbar_frame.pack(fill=tk.X, pady=(0, 5))
        
        # 全选/取消全选按钮
        self.select_all_var = tk.BooleanVar(value=False)
        self.select_all_check = ttk.Checkbutton(self.toolbar_frame, text="全选/取消全选", 
                                              variable=self.select_all_var,
                                              command=self._toggle_select_all)
        self.select_all_check.pack(side=tk.LEFT, padx=5)
        
        # 批量操作按钮
        self.bulk_export_btn = ttk.Button(self.toolbar_frame, text="批量导出",
                                        command=self._bulk_export)
        self.bulk_export_btn.pack(side=tk.LEFT, padx=5)
        
        self.bulk_relation_btn = ttk.Button(self.toolbar_frame, text="批量关联",
                                          command=self._bulk_create_relation)
        self.bulk_relation_btn.pack(side=tk.LEFT, padx=5)
        
        # 选中计数
        self.selection_count_var = tk.StringVar(value="已选择: 0项")
        self.selection_count_label = ttk.Label(self.toolbar_frame, textvariable=self.selection_count_var)
        self.selection_count_label.pack(side=tk.RIGHT, padx=10)
        
        # Main container
        self.main_frame = ttk.Frame(self)
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Create scrollable canvas
        self.canvas = Canvas(self.main_frame)
        self.scrollbar = ttk.Scrollbar(self.main_frame, orient=tk.VERTICAL, command=self.canvas.yview)
        
        self.canvas.configure(yscrollcommand=self.scrollbar.set)
        self.canvas.bind("<Configure>", self._on_canvas_configure)
        
        # Pack scrollbar and canvas
        self.scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # Create frame inside canvas
        self.grid_frame = ttk.Frame(self.canvas)
        self.canvas_window = self.canvas.create_window((0, 0), window=self.grid_frame, anchor="nw")
        
        # Update the scrollregion when the grid_frame changes size
        self.grid_frame.bind("<Configure>", self._on_frame_configure)
        
        # Add pagination controls at bottom
        self.pagination_frame = ttk.Frame(self)
        self.pagination_frame.pack(fill=tk.X, pady=5)
        
        self.prev_button = ttk.Button(self.pagination_frame, text="< Prev", command=self.prev_page)
        self.prev_button.pack(side=tk.LEFT, padx=5)
        
        self.page_label = ttk.Label(self.pagination_frame, text="Page 1 of 1")
        self.page_label.pack(side=tk.LEFT, padx=5)
        
        self.next_button = ttk.Button(self.pagination_frame, text="Next >", command=self.next_page)
        self.next_button.pack(side=tk.LEFT, padx=5)
        
        # Page size options
        ttk.Label(self.pagination_frame, text="Items per page:").pack(side=tk.LEFT, padx=(20, 5))
        self.page_size_var = tk.StringVar(value=str(self.page_size))
        self.page_size_combo = ttk.Combobox(self.pagination_frame, textvariable=self.page_size_var,
                                      values=["12", "24", "36", "48"], width=5)
        self.page_size_combo.pack(side=tk.LEFT)
        self.page_size_combo.bind("<<ComboboxSelected>>", self._on_page_size_changed)
        
        # Set mouse wheel binding
        self.bind_mousewheel()
        
        # 更新界面状态
        self._update_selection_ui()
    
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
        self.current_page = 0
        # 清空选中记录
        self.selected_cards = []
        self.select_all_var.set(False)
        self.refresh_grid()
        
    def set_columns(self, columns):
        """Set the number of columns in the grid"""
        self.columns = columns
    
    def _on_card_selected(self, card, is_selected):
        """处理卡片选择状态改变"""
        if is_selected and card not in self.selected_cards:
            self.selected_cards.append(card)
        elif not is_selected and card in self.selected_cards:
            self.selected_cards.remove(card)
            
        # 更新UI状态
        self._update_selection_ui()
    
    def _update_selection_ui(self):
        """更新选择相关的UI状态"""
        # 更新计数
        count = len(self.selected_cards)
        self.selection_count_var.set(f"已选择: {count}项")
        
        # 更新批量操作按钮状态
        if count > 0:
            self.bulk_export_btn.configure(state=tk.NORMAL)
            self.bulk_relation_btn.configure(state=tk.NORMAL)
        else:
            self.bulk_export_btn.configure(state=tk.DISABLED)
            self.bulk_relation_btn.configure(state=tk.DISABLED)
        
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
        
    def refresh_grid(self):
        """Refresh the grid display"""
        # Clear existing grid
        for widget in self.grid_frame.winfo_children():
            widget.destroy()
            
        # 清空卡片列表
        self.cards = []
            
        if not self.items:
            # No items to display
            no_items_label = ttk.Label(self.grid_frame, text="No items to display")
            no_items_label.pack(pady=50)
            self._update_pagination_controls()
            self._update_selection_ui()
            return
            
        # Calculate pagination
        total_pages = max(1, math.ceil(len(self.items) / self.page_size))
        if self.current_page >= total_pages:
            self.current_page = total_pages - 1
            
        # Get current page items
        start_idx = self.current_page * self.page_size
        end_idx = min(start_idx + self.page_size, len(self.items))
        current_items = self.items[start_idx:end_idx]
        
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
        
    def next_page(self):
        """Go to next page"""
        total_pages = math.ceil(len(self.items) / self.page_size)
        if self.current_page < total_pages - 1:
            self.current_page += 1
            # 清空选中列表，因为页面变了
            self.selected_cards = []
            self.select_all_var.set(False)
            self.refresh_grid()
            
    def prev_page(self):
        """Go to previous page"""
        if self.current_page > 0:
            self.current_page -= 1
            # 清空选中列表，因为页面变了
            self.selected_cards = []
            self.select_all_var.set(False)
            self.refresh_grid()
            
    def _update_pagination_controls(self):
        """Update pagination controls state"""
        total_pages = max(1, math.ceil(len(self.items) / self.page_size))
        
        # Update page label
        if self.items:
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
                self.refresh_grid()
        except ValueError:
            pass
            
    def _on_image_loaded(self, card, success):
        """Callback when an image is loaded"""
        # This method is called by the ImageLoader when an image finishes loading
        pass
        
    def destroy(self):
        """Clean up resources before destroying widget"""
        if hasattr(self, 'image_loader'):
            self.image_loader.stop()
        super().destroy()

# RelationshipManager类 - 与optimized_app.py中相同
class RelationshipManager(ttk.Frame):
    """UI for creating relationships between documents"""
    def __init__(self, parent, db_client, source_doc):
        super().__init__(parent)
        self.db_client = db_client
        self.source_doc = source_doc
        self.selected_db = None
        self.selected_collection = None
        self.selected_doc = None
        self.selected_rel_type = None
        
        self._create_ui()
    
    def _create_ui(self):
        # Title
        title_frame = ttk.Frame(self)
        title_frame.pack(fill=tk.X, padx=10, pady=5)
        
        source_id = str(self.source_doc.get('_id', 'Unknown'))
        source_title = self.source_doc.get('title', self.source_doc.get('filename', source_id))
        
        ttk.Label(title_frame, text=f"Create relationship for: {source_title}", 
                 font=('Arial', 12, 'bold')).pack(side=tk.LEFT)
        
        # Main content - split into left and right sides
        content_frame = ttk.Frame(self)
        content_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # Left side - target selection
        left_frame = ttk.LabelFrame(content_frame, text="Select Target Document")
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Database selection
        db_frame = ttk.Frame(left_frame)
        db_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(db_frame, text="Database:").pack(side=tk.LEFT)
        self.db_var = tk.StringVar()
        self.db_combo = ttk.Combobox(db_frame, textvariable=self.db_var)
        self.db_combo.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        self.db_combo.bind("<<ComboboxSelected>>", self._on_db_selected)
        
        # Collection selection
        coll_frame = ttk.Frame(left_frame)
        coll_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(coll_frame, text="Collection:").pack(side=tk.LEFT)
        self.collection_var = tk.StringVar()
        self.collection_combo = ttk.Combobox(coll_frame, textvariable=self.collection_var)
        self.collection_combo.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        self.collection_combo.bind("<<ComboboxSelected>>", self._on_collection_selected)
        
        # Document selection
        doc_frame = ttk.Frame(left_frame)
        doc_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        ttk.Label(doc_frame, text="Documents:").pack(anchor=tk.W)
        
        # Document list
        list_frame = ttk.Frame(doc_frame)
        list_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        self.doc_listbox = tk.Listbox(list_frame)
        doc_scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.doc_listbox.yview)
        self.doc_listbox.config(yscrollcommand=doc_scrollbar.set)
        
        self.doc_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        doc_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.doc_listbox.bind("<<ListboxSelect>>", self._on_doc_selected)
        
        # Right side - relationship configuration
        right_frame = ttk.LabelFrame(content_frame, text="Configure Relationship")
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Relationship type
        type_frame = ttk.Frame(right_frame)
        type_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(type_frame, text="Relationship Type:").pack(anchor=tk.W)
        self.rel_type_var = tk.StringVar()
        self.rel_type_combo = ttk.Combobox(type_frame, textvariable=self.rel_type_var,
                                        values=RELATIONSHIP_TYPES)
        self.rel_type_combo.pack(fill=tk.X, padx=5, pady=5)
        self.rel_type_combo.bind("<<ComboboxSelected>>", self._on_rel_type_selected)
        
        # Relationship preview
        preview_frame = ttk.LabelFrame(right_frame, text="Preview")
        preview_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        self.preview_text = tk.Text(preview_frame, wrap=tk.WORD, height=10)
        self.preview_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Create relationship button
        create_button = ttk.Button(right_frame, text="Create Relationship", 
                                command=self._create_relationship)
        create_button.pack(fill=tk.X, padx=5, pady=10)
        
        # Populate initial data
        self._populate_db_list()
    
    def _populate_db_list(self):
        """填充数据库列表"""
        try:
            # 获取数据库列表
            db_list = self.db_client.list_database_names()
            
            # 过滤系统数据库
            db_list = [db for db in db_list if db not in ['admin', 'local', 'config']]
            
            self.db_combo['values'] = db_list
            
            if db_list:
                self.db_combo.current(0)
                self._on_db_selected(None)
                
        except Exception as e:
            print(f"Error getting database list: {e}")
    
    def _on_db_selected(self, event):
        """处理数据库选择事件"""
        self.selected_db = self.db_var.get()
        
        try:
            # 获取集合列表
            if self.selected_db:
                collections = self.db_client[self.selected_db].list_collection_names()
                self.collection_combo['values'] = collections
                
                if collections:
                    self.collection_combo.current(0)
                    self._on_collection_selected(None)
                else:
                    self.collection_combo.set("")
                    self.doc_listbox.delete(0, tk.END)
                    
        except Exception as e:
            print(f"Error getting collection list: {e}")
    
    def _on_collection_selected(self, event):
        """处理集合选择事件"""
        self.selected_collection = self.collection_var.get()
        
        # 清空文档列表
        self.doc_listbox.delete(0, tk.END)
        
        if not self.selected_db or not self.selected_collection:
            return
            
        try:
            # 获取集合中的文档
            collection = self.db_client[self.selected_db][self.selected_collection]
            
            # 限制加载的文档数量
            docs = list(collection.find().limit(100))
            self.docs = docs
            
            # 填充列表框
            for i, doc in enumerate(docs):
                # 尝试找到一个良好的显示名称
                display_name = doc.get('title', doc.get('name', doc.get('filename', str(doc.get('_id')))))
                self.doc_listbox.insert(tk.END, display_name)
                
            if docs:
                self.doc_listbox.selection_set(0)
                self._on_doc_selected(None)
                
        except Exception as e:
            print(f"Error loading documents: {e}")
    
    def _on_doc_selected(self, event):
        """处理文档选择事件"""
        selection = self.doc_listbox.curselection()
        if not selection:
            return
            
        index = selection[0]
        if 0 <= index < len(self.docs):
            self.selected_doc = self.docs[index]
            
            # 更新预览
            self._update_preview()
    
    def _on_rel_type_selected(self, event):
        """处理关系类型选择事件"""
        self.selected_rel_type = self.rel_type_var.get()
        
        # 更新预览
        self._update_preview()
    
    def _create_relationship(self):
        """创建关系"""
        if not self.selected_doc or not self.selected_rel_type:
            messagebox.showwarning("Missing Information", 
                                 "Please select a target document and relationship type")
            return
            
        try:
            # 获取源和目标ID
            source_id = self.source_doc.get('_id')
            target_id = self.selected_doc.get('_id')
            
            if not source_id or not target_id:
                messagebox.showwarning("Missing ID", 
                                     "Source or target document is missing ID")
                return
                
            # 创建关系文档
            relationship = {
                'sourceId': source_id,
                'sourceCollection': self.source_doc.get('_collection', 'unknown'),
                'targetId': target_id,
                'targetCollection': self.selected_collection,
                'type': self.selected_rel_type,
                'created': time.time()
            }
            
            # 找到关系集合
            relationships_db = self.db_client.get_database('relationships')
            if not relationships_db:
                # 创建关系数据库
                relationships_db = self.db_client['relationships']
                
            rel_collection = relationships_db['art_relationships']
            
            # 检查是否已存在相同的关系
            existing = rel_collection.find_one({
                'sourceId': source_id,
                'targetId': target_id,
                'type': self.selected_rel_type
            })
            
            if existing:
                messagebox.showinfo("Already Exists", 
                                  "This relationship already exists")
                return
                
            # 插入关系
            result = rel_collection.insert_one(relationship)
            
            if result.inserted_id:
                messagebox.showinfo("Success", 
                                  f"Relationship created successfully with ID: {result.inserted_id}")
                
                # 关闭窗口
                self.master.destroy()
            else:
                messagebox.showwarning("Error", 
                                     "Failed to create relationship")
                
        except Exception as e:
            messagebox.showerror("Error", f"Error creating relationship: {str(e)}")
    
    def _update_preview(self):
        """更新关系预览"""
        if not self.selected_doc or not self.selected_rel_type:
            self.preview_text.delete(1.0, tk.END)
            return
            
        # 获取源和目标名称
        source_name = self.source_doc.get('title', 
                                      self.source_doc.get('name', 
                                                     self.source_doc.get('filename', 
                                                                     str(self.source_doc.get('_id')))))
                                                                     
        target_name = self.selected_doc.get('title', 
                                       self.selected_doc.get('name', 
                                                        self.selected_doc.get('filename', 
                                                                         str(self.selected_doc.get('_id')))))
                                                                         
        # 创建预览文本
        preview = f"Source: {source_name}\n"
        preview += f"Relationship: {self.selected_rel_type}\n"
        preview += f"Target: {target_name}\n\n"
        
        # 添加关系的描述
        rel_descriptions = {
            "Created": "This relationship indicates that the source created the target.",
            "BelongsTo": "This relationship indicates that the target belongs to the source.",
            "Influenced": "This relationship indicates that the source influenced the target.",
            "Contains": "This relationship indicates that the source contains the target.",
            "InheritedFrom": "This relationship indicates that the source inherited from the target.",
            "CollaboratedWith": "This relationship indicates that the source collaborated with the target."
        }
        
        if self.selected_rel_type in rel_descriptions:
            preview += rel_descriptions[self.selected_rel_type]
            
        # 更新预览文本
        self.preview_text.delete(1.0, tk.END)
        self.preview_text.insert(tk.END, preview)

# MongoDBViewer类 - 我们需要修改这个类以支持自动连接
class MongoDBViewer(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("MongoDB Art Database Viewer - Auto Connect")
        self.geometry(WINDOW_SIZE)
        
        # 设置MongoDB连接
        self.db_client = None
        self.current_db = None
        self.current_collection = None
        self.current_docs = []
        
        # UI配置
        self.grid_columns = DEFAULT_GRID_COLUMNS
        self.image_width = 250
        self.image_height = 200
        
        # 创建主界面
        self.create_ui()
        
        # 设置窗口关闭事件
        self.protocol("WM_DELETE_WINDOW", self.on_close)
        
        # 如果配置了自动连接，则启动时自动连接MongoDB
        if AUTO_CONNECT:
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
        self.uri_entry.insert(0, DEFAULT_MONGODB_URI)
        self.uri_entry.pack(fill=tk.X, padx=5, pady=2)
        
        # 添加自动连接选项
        self.auto_connect_var = tk.BooleanVar(value=AUTO_CONNECT)
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
            
            # 如果指定了默认数据库，自动选择该数据库
            if DEFAULT_DATABASE:
                for item_id in self.db_tree.get_children():
                    item_text = self.db_tree.item(item_id, "text")
                    if item_text == DEFAULT_DATABASE:
                        self.db_tree.selection_set(item_id)
                        self.db_tree.see(item_id)
                        self.on_tree_select(None)  # 手动触发选择事件
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
            
            self.update_status(f"Selected collection: {parent_text}.{item_text}")
            
            # 加载集合数据
            self.load_collection_data()
        else:  # 这是一个数据库
            self.current_db = item_text
            self.current_collection = None
            
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
            
            # 更新UI（必须在主线程中完成）
            self.after(0, lambda: self.update_grid_with_docs(docs))
            
        except Exception as e:
            self.after(0, lambda: self.update_status(f"Error loading data: {str(e)}"))
            self.after(0, lambda: messagebox.showerror("Data Error", f"Failed to load documents: {str(e)}"))
    
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
    
    def on_close(self):
        """处理窗口关闭事件"""
        # 保存自动连接设置
        global AUTO_CONNECT
        AUTO_CONNECT = self.auto_connect_var.get()
        
        if hasattr(self, 'paginated_grid') and hasattr(self.paginated_grid, 'image_loader'):
            # 停止图像加载线程
            self.paginated_grid.image_loader.stop()
            
        # 销毁窗口
        self.destroy()

def main():
    app = MongoDBViewer()
    app.mainloop()

if __name__ == "__main__":
    main() 