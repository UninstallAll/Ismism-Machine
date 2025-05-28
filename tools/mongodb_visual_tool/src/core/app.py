#!/usr/bin/env python3
"""
MongoDB Visual Tool - Core Application
"""
import os
import sys
import tkinter as tk
from tkinter import ttk, messagebox, filedialog, Menu
import json
import threading
import queue
from bson.objectid import ObjectId
import datetime

from ..config.settings import WINDOW_SIZE, DEFAULT_DATABASE, RELATIONSHIP_TYPES
from ..config.config_manager import ConfigManager
from ..db.mongo_manager import MongoDBManager
from ..db.validator import DataValidator
from ..ui.paginated_grid import PaginatedGrid
from ..utils.cache_manager import CacheManager
from .view_settings import ViewSettings
from .collection_views import CollectionViews
from .relationship_manager import RelationshipManager

class MongoDBViewer(tk.Tk):
    """MongoDB Visual Tool Main Application"""
    
    def __init__(self):
        """Initialize the application"""
        super().__init__()
        
        # Set window title and size
        self.title("Ismism-Machine MongoDB Visual Tool")
        self.geometry(WINDOW_SIZE)
        
        # Load user configuration
        self.user_config = ConfigManager.load_config()
        
        # Database connection
        self.db_manager = None
        self.current_db = None
        self.current_collection = None
        self.current_docs = []
        
        # Initialize collection views manager
        self.collection_views = CollectionViews()
        
        # Initialize cache manager
        self.cache_manager = CacheManager()
        
        # 初始化关系管理器（创建UI时才会真正创建实例）
        self.relationship_manager = None
        
        # 当前高亮的文档ID
        self.highlighted_doc_id = None
        
        # Create UI
        self.create_ui()
        
        # Create menu bar
        self.create_menu_bar()
        
        # Set window close event
        self.protocol("WM_DELETE_WINDOW", self.on_close)
        
        # Auto connect
        if self.user_config.get("auto_connect", True):
            self.after(500, self.auto_connect_mongodb)
    
    def create_menu_bar(self):
        """创建菜单栏"""
        # 创建主菜单栏
        self.menu_bar = Menu(self)
        self.config(menu=self.menu_bar)
        
        # 文件菜单
        file_menu = Menu(self.menu_bar, tearoff=0)
        file_menu.add_command(label="连接数据库", command=self.connect_mongodb)
        file_menu.add_command(label="导入图片/文件", command=self.show_import_menu)
        file_menu.add_command(label="导入JSON数据", command=self.import_json)
        file_menu.add_separator()
        file_menu.add_command(label="退出", command=self.on_close)
        self.menu_bar.add_cascade(label="文件", menu=file_menu)
        
        # 视图菜单
        view_menu = Menu(self.menu_bar, tearoff=0)
        view_menu.add_command(label="刷新数据", command=self.load_collection_data)
        view_menu.add_command(label="调整网格布局", command=self.update_grid_layout)
        self.menu_bar.add_cascade(label="视图", menu=view_menu)
        
        # 工具菜单
        tools_menu = Menu(self.menu_bar, tearoff=0)
        
        # 缓存管理子菜单
        cache_menu = Menu(tools_menu, tearoff=0)
        cache_menu.add_command(label="查看缓存状态", command=self.show_cache_stats)
        
        # 缓存启用/禁用选项
        self.cache_enabled = tk.BooleanVar(value=True)
        cache_menu.add_checkbutton(label="启用缓存", variable=self.cache_enabled, 
                                  command=self.toggle_cache)
        
        cache_menu.add_separator()
        cache_menu.add_command(label="清理所有缓存", command=lambda: self.clear_cache())
        cache_menu.add_command(label="清理图片缓存", command=lambda: self.clear_cache("images"))
        cache_menu.add_command(label="清理文档缓存", command=lambda: self.clear_cache("documents"))
        cache_menu.add_command(label="清理缩略图缓存", command=lambda: self.clear_cache("thumbnails"))
        cache_menu.add_command(label="清理临时缓存", command=lambda: self.clear_cache("temp"))
        cache_menu.add_separator()
        cache_menu.add_command(label="清理旧缓存 (7天)", command=lambda: self.cleanup_old_cache(7))
        cache_menu.add_command(label="清理旧缓存 (30天)", command=lambda: self.cleanup_old_cache(30))
        
        tools_menu.add_cascade(label="缓存管理", menu=cache_menu)
        tools_menu.add_separator()
        tools_menu.add_command(label="批量导出", command=lambda: self.bulk_export_documents(self.current_docs))
        tools_menu.add_command(label="批量关联", command=lambda: self.bulk_create_relationships(self.current_docs))
        
        self.menu_bar.add_cascade(label="工具", menu=tools_menu)
        
        # 帮助菜单
        help_menu = Menu(self.menu_bar, tearoff=0)
        help_menu.add_command(label="使用帮助", command=self.show_help)
        help_menu.add_command(label="关于", command=self.show_about)
        self.menu_bar.add_cascade(label="帮助", menu=help_menu)
    
    def create_ui(self):
        """Create user interface"""
        # Main paned window
        self.main_pane = ttk.PanedWindow(self, orient=tk.HORIZONTAL)
        self.main_pane.pack(fill=tk.BOTH, expand=True)
        
        # Left panel - Database browser
        self.left_frame = ttk.Frame(self.main_pane)
        self.main_pane.add(self.left_frame)
        
        # Connection settings
        conn_frame = ttk.LabelFrame(self.left_frame, text="Connection Settings")
        conn_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(conn_frame, text="MongoDB URI:").pack(anchor=tk.W, padx=5)
        self.uri_entry = ttk.Entry(conn_frame)
        self.uri_entry.insert(0, self.user_config.get("mongodb_uri", "mongodb://localhost:27017/"))
        self.uri_entry.pack(fill=tk.X, padx=5, pady=2)
        
        # Auto connect option
        self.auto_connect_var = tk.BooleanVar(value=self.user_config.get("auto_connect", True))
        self.auto_connect_checkbox = ttk.Checkbutton(
            conn_frame,
            text="Auto connect on startup",
            variable=self.auto_connect_var
        )
        self.auto_connect_checkbox.pack(anchor=tk.W, padx=5, pady=2)
        
        connect_button = ttk.Button(conn_frame, text="Connect", command=self.connect_mongodb)
        connect_button.pack(fill=tk.X, padx=5, pady=5)

        # --- 新增：导入按钮 ---
        import_button = ttk.Button(conn_frame, text="导入图片/词条", command=self.show_import_menu)
        import_button.pack(fill=tk.X, padx=5, pady=5)
        
        # Database and collection tree view
        tree_frame = ttk.LabelFrame(self.left_frame, text="Databases and Collections")
        tree_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        self.db_tree = ttk.Treeview(tree_frame, show="tree")
        self.db_tree.pack(fill=tk.BOTH, expand=True)
        self.db_tree.bind("<<TreeviewSelect>>", self.on_tree_select)
        # 添加右键菜单绑定
        self.db_tree.bind("<Button-3>", self._show_collection_menu)
        
        # Status bar
        self.status_var = tk.StringVar(value="Ready")
        self.status_bar = ttk.Label(self.left_frame, textvariable=self.status_var, relief=tk.SUNKEN, anchor=tk.W)
        self.status_bar.pack(fill=tk.X, padx=5, pady=5)
        
        # Center paned window for content and relationships
        self.center_pane = ttk.PanedWindow(self.main_pane, orient=tk.HORIZONTAL)
        self.main_pane.add(self.center_pane, weight=3)  # 给中间区域更多空间
        
        # Document viewer panel (center)
        self.doc_frame = ttk.Frame(self.center_pane)
        self.center_pane.add(self.doc_frame, weight=2)  # 文档区域占据更多空间
        
        # Create paginated grid
        self.paginated_grid = PaginatedGrid(self.doc_frame, on_show_details=self.show_document_details)
        self.paginated_grid.pack(fill=tk.BOTH, expand=True)
        self.paginated_grid.set_context_menu_callback(self.handle_context_menu)
        
        # Relationship management panel (right)
        self.relationship_frame = ttk.Frame(self.center_pane)
        self.center_pane.add(self.relationship_frame, weight=1)
        
        # 使用RelationshipManager创建关系管理界面
        self.relationship_manager = RelationshipManager(
            self.relationship_frame, 
            self.db_manager, 
            on_relationship_change=self.refresh_relationships_callback,
            on_navigate_to_target=self.navigate_to_target_document
        )
        
        # 设置关系类型
        self.relationship_manager.set_relationship_types(RELATIONSHIP_TYPES)
        
        # Bottom panel - JSON viewer
        self.json_frame = ttk.LabelFrame(self, text="Document Details")
        self.json_frame.pack(fill=tk.BOTH, padx=5, pady=5, expand=False)
        
        self.json_text = tk.Text(self.json_frame, wrap=tk.WORD, height=10)
        self.json_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
    
    def auto_connect_mongodb(self):
        """Auto connect to MongoDB"""
        try:
            uri = self.uri_entry.get()
            self.update_status(f"Auto connecting to {uri}...")
            
            # Create database manager
            self.db_manager = MongoDBManager(uri)
            self.db_manager.connect()
            
            # 更新关系管理器的数据库管理器引用
            if self.relationship_manager:
                self.relationship_manager.db_manager = self.db_manager
            
            self.update_status("Successfully connected to MongoDB")
            self.populate_db_tree()
            
            # Remember last selected database and collection
            last_db = self.user_config.get("last_db", "")
            last_collection = self.user_config.get("last_collection", "")
            
            if last_db:
                # Find and select database node
                for db_id in self.db_tree.get_children():
                    if self.db_tree.item(db_id, "text") == last_db:
                        self.db_tree.selection_set(db_id)
                        self.db_tree.see(db_id)
                        self.db_tree.item(db_id, open=True)  # Expand database node
                        
                        # If there's a last selected collection, find and select it
                        if last_collection:
                            for coll_id in self.db_tree.get_children(db_id):
                                if self.db_tree.item(coll_id, "text") == last_collection:
                                    self.db_tree.selection_set(coll_id)
                                    self.db_tree.see(coll_id)
                                    self.on_tree_select(None)  # Manually trigger selection event
                                    break
                            else:
                                # If last collection not found but database found, trigger database selection
                                self.on_tree_select(None)
                        else:
                            # If no last collection, just trigger database selection
                            self.on_tree_select(None)
                        break
                
        except Exception as e:
            self.update_status(f"Auto connect failed: {str(e)}")
            messagebox.showerror("Auto Connect Error", f"Could not auto connect to MongoDB: {str(e)}")
    
    def connect_mongodb(self):
        """Manually connect to MongoDB"""
        uri = self.uri_entry.get()
        try:
            self.update_status(f"Connecting to {uri}...")
            
            # Create database manager
            self.db_manager = MongoDBManager(uri)
            self.db_manager.connect()
            
            # 更新关系管理器的数据库管理器引用
            if self.relationship_manager:
                self.relationship_manager.db_manager = self.db_manager
            
            self.update_status("Successfully connected to MongoDB")
            messagebox.showinfo("Connection", "Successfully connected to MongoDB")
            
            # Update configuration
            self.user_config["mongodb_uri"] = uri
            self.user_config["auto_connect"] = self.auto_connect_var.get()
            ConfigManager.save_config(self.user_config)
            
            # Populate database tree
            self.populate_db_tree()
            
        except Exception as e:
            self.update_status(f"Connection failed: {str(e)}")
            messagebox.showerror("Connection Error", f"Could not connect to MongoDB: {str(e)}")
    
    def populate_db_tree(self):
        """Populate database tree view"""
        # Clear existing content
        self.db_tree.delete(*self.db_tree.get_children())
        
        if self.db_manager is None:
            return
            
        try:
            # Get database list
            databases = self.db_manager.list_databases()
            
            # Add databases to tree view
            for db_name in databases:
                db_node = self.db_tree.insert("", "end", text=db_name, open=False, tags=("database",))
                
                # Get collection list
                collections = self.db_manager.list_collections(db_name)
                
                # Add collections to tree view
                for coll_name in collections:
                    self.db_tree.insert(db_node, "end", text=coll_name, tags=("collection",))
                    
        except Exception as e:
            self.update_status(f"Failed to populate database tree: {str(e)}")
            messagebox.showerror("Error", f"Failed to get database list: {str(e)}")
    
    def on_tree_select(self, event):
        """处理树节点选择事件"""
        selection = self.db_tree.selection()
        if not selection:
            return
            
        item = selection[0]
        parent = self.db_tree.parent(item)
        
        if parent:  # 选择的是集合
            db_name = self.db_tree.item(parent, "text")
            collection_name = self.db_tree.item(item, "text")
            
            # 更新配置
            self.user_config["last_db"] = db_name
            self.user_config["last_collection"] = collection_name
            ConfigManager.save_config(self.user_config)
            
            # 更新当前选择
            self.current_db = db_name
            self.current_collection = collection_name
            
            # 更新关系管理器的数据库和集合
            if hasattr(self, 'relationship_manager') and self.relationship_manager:
                self.relationship_manager.set_current_database(db_name)
                self.relationship_manager.set_current_collection(collection_name)
            
            # 更新集合模式
            self.update_collection_schema()
            
            # 应用该集合保存的视图类型
            saved_view_type = self.collection_views.get_view(db_name, collection_name)
            self._switch_view(db_name, collection_name, saved_view_type)
            
            # 加载数据
            self.load_collection_data()
        else:  # 选择的是数据库
            db_name = self.db_tree.item(item, "text")
            
            # 更新配置
            self.user_config["last_db"] = db_name
            self.user_config["last_collection"] = ""
            ConfigManager.save_config(self.user_config)
            
            # 更新当前选择
            self.current_db = db_name
            self.current_collection = None
            
            # 更新关系管理器的数据库
            if hasattr(self, 'relationship_manager') and self.relationship_manager:
                self.relationship_manager.set_current_database(db_name)
                self.relationship_manager.set_current_collection(None)
    
    def update_collection_schema(self):
        """获取并更新集合的字段结构"""
        if not self.current_db or not self.current_collection:
            return
        
        try:
            # 使用新的方法获取实际的字段结构
            self.current_schema = self.db_manager.get_collection_schema(self.current_db, self.current_collection)
            # 更新UI显示
            self.paginated_grid.set_schema(self.current_schema)
        except Exception as e:
            self.current_schema = None
            self.paginated_grid.set_schema(None)
            self.update_status(f"获取集合结构失败: {e}")
    
    def load_collection_data(self, highlight_doc_id=None):
        """Load collection data
        
        Args:
            highlight_doc_id (str, optional): 需要高亮显示的文档ID
        """
        if not self.current_db or not self.current_collection or not self.db_manager:
            return
        
        if highlight_doc_id:
            self.highlighted_doc_id = highlight_doc_id
            
        self.update_status(f"Loading {self.current_db}.{self.current_collection} data...")
        
        # Create and start loading thread
        load_thread = threading.Thread(target=self._load_data_thread)
        load_thread.daemon = True
        load_thread.start()
    
    def _load_data_thread(self):
        """Data loading thread"""
        try:
            # Get documents
            docs = self.db_manager.get_documents(self.current_db, self.current_collection, limit=500)
            
            # Validate documents
            valid_docs, inconsistencies = self.validate_documents_with_files(docs)
            
            # If there are inconsistencies, log them
            if inconsistencies:
                self.log_inconsistencies(inconsistencies)
            
            # Update UI
            self.after(0, lambda: self.update_grid_with_docs(valid_docs))
            
        except Exception as e:
            self.after(0, lambda: self.update_status(f"Failed to load data: {str(e)}"))
            print(f"加载数据失败: {e}")
            import traceback
            traceback.print_exc()
    
    def validate_documents_with_files(self, docs):
        """Validate file paths in documents
        
        Args:
            docs (list): List of documents
        
        Returns:
            tuple: (valid documents, inconsistency list)
        """
        # 使用DataValidator类进行验证
        return DataValidator.validate_documents_with_files(docs)
    
    def log_inconsistencies(self, inconsistencies):
        """Log inconsistencies
        
        Args:
            inconsistencies (list): List of inconsistencies
        """
        if not inconsistencies:
            return
        
        # Create log directory
        log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "logs")
        os.makedirs(log_dir, exist_ok=True)
        
        # Create log file
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        log_file = os.path.join(log_dir, f"inconsistencies_{timestamp}.json")
        
        try:
            with open(log_file, 'w', encoding='utf-8') as f:
                json.dump({
                    'timestamp': timestamp,
                    'database': self.current_db,
                    'collection': self.current_collection,
                    'inconsistencies': inconsistencies
                }, f, indent=2, default=str)
            
            self.update_status(f"Found {len(inconsistencies)} inconsistencies, logged to {log_file}")
        except Exception as e:
            self.update_status(f"Failed to log inconsistencies: {str(e)}")
    
    def update_grid_with_docs(self, docs):
        """Update documents in grid view
        
        Args:
            docs (list): List of documents
        """
        self.current_docs = docs
        self.paginated_grid.set_columns(self.user_config.get("grid_columns", 4))
        self.paginated_grid.set_items(docs)
        
        doc_count = len(docs)
        self.update_status(f"Loaded {doc_count} documents")
        
        # 如果有高亮的文档ID，查找并高亮
        if self.highlighted_doc_id:
            self.highlight_document(self.highlighted_doc_id)
    
    def update_status(self, message):
        """Update status bar
        
        Args:
            message (str): Status message
        """
        self.status_var.set(message)
    
    def update_grid_layout(self):
        """Update grid layout"""
        columns = self.user_config.get("grid_columns", 4)
        self.paginated_grid.set_columns(columns)
        self.paginated_grid.refresh_grid()
    
    def handle_context_menu(self, action, doc, event=None):
        """Handle context menu actions
        
        Args:
            action (str): Action type
            doc: Document or document list
            event: Event object (optional)
        """
        try:
            if action == "view":
                self.edit_document_dialog(doc)
            elif action == "export":
                self.export_document(doc)
            elif action == "relate":
                # 使用关系管理器，选中文档并加载关系
                if isinstance(doc, list) and len(doc) > 0:
                    doc = doc[0]
                # 确保文档在选中状态
                for card in self.paginated_grid.displayed_cards:
                    if card.doc.get('_id') == doc.get('_id'):
                        card.set_selected(True)
                        break
                # 加载关系
                if hasattr(self, 'relationship_manager') and self.relationship_manager:
                    self.relationship_manager.load_document_relationships(doc)
                # 突出显示关系面板
                self.center_pane.sashpos(0, int(self.winfo_width() * 0.6))
            elif action == "delete":
                # 支持批量删除
                if isinstance(doc, list):
                    self.delete_documents(doc)
                else:
                    self.delete_document(doc)
            elif action == "bulk_export":
                self.bulk_export_documents(doc)
            elif action == "bulk_relate":
                self.bulk_create_relationships(doc)
        except Exception as e:
            import traceback
            traceback.print_exc()
            messagebox.showerror("Action Error", f"Error performing action: {str(e)}")
            self.update_status(f"Error: {str(e)}")
    
    def edit_document_dialog(self, doc):
        """弹出编辑文档信息的表单，保存到数据库"""
        if not self.current_db or not self.current_collection:
            messagebox.showwarning("未选择集合", "请先在左侧选择目标数据库和集合！")
            return
        dialog = tk.Toplevel(self)
        dialog.title("编辑文件信息")
        dialog.grab_set()
        dialog.resizable(False, False)
        main_frame = ttk.Frame(dialog, padding=10)
        main_frame.pack(fill=tk.BOTH, expand=True)
        entries = {}
        row = 0
        for key, value in doc.items():
            if key == "_id":
                ttk.Label(main_frame, text=f"ID: {value}").grid(row=row, column=0, sticky=tk.W, pady=5, columnspan=2)
                row += 1
                continue
            ttk.Label(main_frame, text=key+":").grid(row=row, column=0, sticky=tk.W, pady=5)
            entry = ttk.Entry(main_frame, width=40)
            entry.insert(0, str(value))
            entry.grid(row=row, column=1, sticky=tk.W, pady=5)
            entries[key] = entry
            row += 1
        btn_frame = ttk.Frame(main_frame)
        btn_frame.grid(row=row, column=0, columnspan=2, pady=10)
        def on_save():
            update_data = {}
            for k, entry in entries.items():
                v = entry.get()
                # 尝试类型转换
                if k == "size":
                    try:
                        v = int(v)
                    except:
                        pass
                update_data[k] = v
            try:
                success = self.db_manager.update_document(
                    self.current_db,
                    self.current_collection,
                    str(doc.get("_id")),
                    update_data
                )
                if success:
                    messagebox.showinfo("保存成功", "文件信息已更新！")
                    dialog.destroy()
                    self.load_collection_data()
                else:
                    messagebox.showerror("保存失败", "数据库未更新任何内容。")
            except Exception as e:
                messagebox.showerror("保存失败", f"数据库更新失败: {e}")
        ttk.Button(btn_frame, text="保存", command=on_save).pack(side=tk.RIGHT, padx=5)
        ttk.Button(btn_frame, text="取消", command=dialog.destroy).pack(side=tk.RIGHT, padx=5)
        # 居中弹窗
        dialog.update_idletasks()
        width = dialog.winfo_width()
        height = dialog.winfo_height()
        x = (dialog.winfo_screenwidth() // 2) - (width // 2)
        y = (dialog.winfo_screenheight() // 2) - (height // 2)
        dialog.geometry(f'{width}x{height}+{x}+{y}')
        self.wait_window(dialog)
    
    def show_document_details(self, doc):
        """Show document details
        
        Args:
            doc: Document object
        """
        try:
            # Convert BSON document to JSON and display in text box
            json_text = self.bson_to_json(doc)
            self.json_text.delete(1.0, tk.END)
            self.json_text.insert(tk.END, json_text)
            
            # 加载并显示关系 - 使用关系管理器
            if self.relationship_manager:
                self.relationship_manager.load_document_relationships(doc)
        except Exception as e:
            import traceback
            traceback.print_exc()
            self.update_status(f"Error showing document details: {str(e)}")
    
    def bson_to_json(self, doc):
        """Convert BSON document to JSON string
        
        Args:
            doc: BSON document
            
        Returns:
            str: Formatted JSON string
        """
        def convert(obj):
            if isinstance(obj, ObjectId):
                return str(obj)
            elif isinstance(obj, datetime.datetime):
                return obj.isoformat()
            elif isinstance(obj, dict):
                return {k: convert(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert(i) for i in obj]
            else:
                return obj
        try:
            json_doc = convert(doc)
            return json.dumps(json_doc, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"JSON conversion error: {e}")
            import traceback
            traceback.print_exc()
            return f"Error converting document to JSON: {str(e)}"
    
    def refresh_relationships_callback(self):
        """关系变更的回调函数"""
        # 在这里可以添加关系变更后需要执行的操作
        self.update_status("关系已更新")
        # 如果需要，可以刷新当前文档或视图
    
    def export_document(self, doc):
        """Export document to file
        
        Args:
            doc: Document object
        """
        # Get filename
        filename = doc.get('filename', 'document')
        filename = f"{filename.split('.')[0]}.json"
        
        # Open file dialog
        file_path = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON Files", "*.json"), ("All Files", "*.*")],
            initialfile=filename
        )
        
        if file_path:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    # Convert document to JSON and write to file
                    f.write(self.bson_to_json(doc))
                    
                self.update_status(f"Document exported to {file_path}")
                messagebox.showinfo("Export Successful", f"Document exported to {file_path}")
            except Exception as e:
                self.update_status(f"Export failed: {str(e)}")
                messagebox.showerror("Export Error", f"Failed to export document: {str(e)}")
    
    def bulk_export_documents(self, docs):
        """Bulk export documents
        
        Args:
            docs (list): Document list
        """
        if not docs:
            return
            
        # Open folder dialog
        folder_path = filedialog.askdirectory(
            title="Select Save Location"
        )
        
        if folder_path:
            try:
                # Export each document
                exported_count = 0
                for doc in docs:
                    # Get filename
                    filename = doc.get('filename', str(doc.get('_id', 'document')))
                    filename = f"{filename.split('.')[0]}.json"
                    
                    # Avoid filename conflicts
                    base_name = os.path.splitext(filename)[0]
                    ext = os.path.splitext(filename)[1]
                    counter = 1
                    while os.path.exists(os.path.join(folder_path, filename)):
                        filename = f"{base_name}_{counter}{ext}"
                        counter += 1
                    
                    # Write file
                    file_path = os.path.join(folder_path, filename)
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(self.bson_to_json(doc))
                    
                    exported_count += 1
                
                self.update_status(f"Exported {exported_count} documents to {folder_path}")
                messagebox.showinfo("Export Successful", f"Exported {exported_count} documents to {folder_path}")
                
            except Exception as e:
                self.update_status(f"Bulk export failed: {str(e)}")
                messagebox.showerror("Export Error", f"Bulk document export failed: {str(e)}")
    
    def bulk_create_relationships(self, docs):
        """Bulk create relationships
        
        Args:
            docs (list): Document list
        """
        if not docs or len(docs) < 1:
            messagebox.showwarning("No Documents", "No documents selected for relationship creation.")
            return
            
        if not self.current_db:
            messagebox.showwarning("No Database Selected", "No database is currently selected.")
            return
        
        # 使用关系管理器的批量创建关系功能
        if hasattr(self, 'relationship_manager') and self.relationship_manager:
            success = self.relationship_manager.bulk_create_relationships(docs)
            if success:
                self.update_status(f"成功创建关系")
        else:
            messagebox.showwarning("Error", "Relationship manager not available")
    
    def delete_document(self, doc):
        """Delete document
        
        Args:
            doc: Document object
        """
        if not self._validate_collection_selected():
            return
        
        # 确认删除
        if not self._confirm_deletion([doc]):
            return
        
        try:
            success = self.db_manager.delete_document(
                self.current_db, 
                self.current_collection,
                str(doc.get('_id'))
            )
            
            if success:
                self.update_status("Document deleted successfully")
                messagebox.showinfo("Delete Successful", "Document has been deleted successfully.")
                self.load_collection_data()
            else:
                self._handle_delete_error("Failed to delete the document.")
        except Exception as e:
            self._handle_delete_error(f"Failed to delete document: {str(e)}")
    
    def delete_documents(self, docs):
        """Delete multiple documents
        
        Args:
            docs (list): List of documents to delete
        """
        if not self._validate_collection_selected() or not docs:
            return
        
        # 确认删除
        if not self._confirm_deletion(docs):
            return
        
        success_count = 0
        failed_docs = []
        
        for doc in docs:
            try:
                if self.db_manager.delete_document(
                    self.current_db,
                    self.current_collection,
                    str(doc.get('_id'))
                ):
                    success_count += 1
                else:
                    failed_docs.append(doc)
            except Exception as e:
                print(f"Delete failed: {doc.get('_id')}, {e}")
                failed_docs.append(doc)
        
        if success_count:
            self.update_status(f"Deleted {success_count} documents successfully")
            messagebox.showinfo("Delete Successful", f"Deleted {success_count} documents successfully.")
            self.load_collection_data()
        else:
            self._handle_delete_error("Failed to delete the selected documents.")
        
        if failed_docs:
            failed_ids = [str(doc.get('_id')) for doc in failed_docs]
            print(f"Failed to delete documents: {', '.join(failed_ids)}")
    
    def _validate_collection_selected(self):
        """验证是否已选择集合
        
        Returns:
            bool: 是否已选择集合
        """
        if not self.current_db or not self.current_collection:
            messagebox.showwarning("No Collection Selected", "No collection is currently selected.")
            return False
        return True
    
    def _confirm_deletion(self, docs):
        """确认删除操作
        
        Args:
            docs (list): 要删除的文档列表
        
        Returns:
            bool: 用户是否确认删除
        """
        if len(docs) == 1:
            doc = docs[0]
            message = (f"Are you sure you want to delete this document?\n\n" +
                      f"Filename: {doc.get('filename', 'Unknown')}\n" +
                      f"ID: {doc.get('_id', 'Unknown')}")
        else:
            message = (f"Are you sure you want to delete {len(docs)} documents?\n\n" +
                      "\n".join([str(doc.get('filename', doc.get('_id', 'Unknown'))) for doc in docs[:5]]) +
                      ("\n..." if len(docs) > 5 else ""))
        
        return messagebox.askyesno("Confirm Deletion", message)
    
    def _handle_delete_error(self, message):
        """处理删除错误
        
        Args:
            message (str): 错误信息
        """
        self.update_status(message)
        messagebox.showerror("Delete Failed", message)
    
    def on_close(self):
        """Handle window close event"""
        # Save current configuration
        self.user_config["auto_connect"] = self.auto_connect_var.get()
        ConfigManager.save_config(self.user_config)
        
        # Destroy window
        self.destroy()

    # --- Import menu and handlers ---
    def show_import_menu(self):
        """Show import menu"""
        menu = tk.Menu(self, tearoff=0)
        menu.add_command(label="Import Files", command=self.import_files)
        menu.add_command(label="Import JSON", command=self.import_json)
        try:
            menu.tk_popup(self.winfo_pointerx(), self.winfo_pointery())
        finally:
            menu.grab_release()

    def import_files(self):
        """Import files into collection"""
        if not self.current_db or not self.current_collection:
            messagebox.showwarning("No Collection Selected", "Please select a target collection first!")
            return
            
        file_paths = filedialog.askopenfilenames(
            title="Select Files",
            filetypes=[
                ("All Supported Files", "*.png;*.jpg;*.jpeg;*.bmp;*.gif;*.json"),
                ("Image Files", "*.png;*.jpg;*.jpeg;*.bmp;*.gif"),
                ("JSON Files", "*.json"),
                ("All Files", "*.*")
            ]
        )
        
        if not file_paths:
            return
            
        inserted = 0
        for path in file_paths:
            filename = os.path.basename(path)
            # 使用文件名（不包含扩展名）作为标题
            title = os.path.splitext(filename)[0]
            doc = {
                "filePath": path,
                "filename": filename,
                "title": title,  # 添加title字段
                "size": os.path.getsize(path),
                "importedAt": datetime.datetime.now()
            }
            try:
                self.db_manager.insert_document(self.current_db, self.current_collection, doc)
                inserted += 1
            except Exception as e:
                print(f"Import failed: {path}, Error: {e}")
                
        self.update_status(f"Successfully imported {inserted} files")
        self.load_collection_data()

    def import_json(self):
        """Import data from JSON file"""
        if not self.current_db or not self.current_collection:
            messagebox.showwarning("No Collection Selected", "Please select a target collection first!")
            return
            
        file_path = filedialog.askopenfilename(
            title="Select JSON File",
            filetypes=[("JSON Files", "*.json"), ("All Files", "*.*")]
        )
        
        if not file_path:
            return
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if not isinstance(data, (list, dict)):
                messagebox.showerror("Format Error", "Invalid JSON format. Must be an array or object.")
                return
                
            # Convert to list if it's a dictionary
            if isinstance(data, dict):
                data = [data]
                
            # Add import timestamp
            for item in data:
                if isinstance(item, (str, int, float)):
                    item = {"content": str(item)}
                item["importedAt"] = datetime.datetime.now()
                
            # Bulk insert
            result = self.db_manager.insert_many(self.current_db, self.current_collection, data)
            
            if result:
                messagebox.showinfo("Import Successful", f"Successfully imported {len(data)} items")
                self.load_collection_data()
            else:
                messagebox.showerror("Import Failed", "An error occurred during import")
                
        except json.JSONDecodeError:
            messagebox.showerror("Format Error", "Invalid JSON format")
        except Exception as e:
            messagebox.showerror("Import Failed", f"Import failed: {e}")

    def _show_collection_menu(self, event):
        """Show right-click menu for collection"""
        item = self.db_tree.identify_row(event.y)
        if not item or not self.db_tree.parent(item):
            return
            
        db_name = self.db_tree.item(self.db_tree.parent(item), "text")
        collection_name = self.db_tree.item(item, "text")
        current_view = self.collection_views.get_view(db_name, collection_name)
        
        menu = tk.Menu(self, tearoff=0)
        menu.add_command(
            label="Grid View" if current_view == "list" else "List View",
            command=lambda: self._switch_view(db_name, collection_name, 
                                           "grid" if current_view == "list" else "list")
        )
        menu.post(event.x_root, event.y_root)

    def _switch_view(self, db_name, collection_name, view_type):
        """Switch collection view type"""
        self.collection_views.set_view(db_name, collection_name, view_type)
        self.collection_views.set_default_view(db_name, collection_name, view_type)
        
        if self.current_db == db_name and self.current_collection == collection_name:
            self.paginated_grid.current_view = view_type
            if view_type == "grid":
                self.paginated_grid.list_frame.pack_forget()
                self.paginated_grid.grid_frame.pack(fill=tk.BOTH, expand=True)
                self.paginated_grid.refresh_grid()
            else:
                self.paginated_grid.grid_frame.pack_forget()
                self.paginated_grid.list_frame.pack(fill=tk.BOTH, expand=True)
                self.paginated_grid.refresh_list()
            
            self.update_status(f"Switched to {view_type.capitalize()} View")

    # 新增的缓存管理相关方法
    def show_cache_stats(self):
        """显示缓存统计信息"""
        # 更新缓存统计
        self.cache_manager.update_cache_stats()
        stats = self.cache_manager.get_cache_stats()
        
        # 创建统计信息显示窗口
        stats_window = tk.Toplevel(self)
        stats_window.title("缓存统计信息")
        stats_window.geometry("400x300")
        stats_window.resizable(False, False)
        stats_window.transient(self)
        stats_window.grab_set()
        
        # 创建统计信息显示框架
        frame = ttk.Frame(stats_window, padding=10)
        frame.pack(fill=tk.BOTH, expand=True)
        
        # 显示统计信息
        ttk.Label(frame, text="缓存统计信息", font=("Helvetica", 12, "bold")).grid(row=0, column=0, columnspan=2, pady=10, sticky=tk.W)
        
        ttk.Label(frame, text="总大小:").grid(row=1, column=0, sticky=tk.W, pady=2)
        ttk.Label(frame, text=self.cache_manager.get_cache_size_formatted()).grid(row=1, column=1, sticky=tk.W, pady=2)
        
        ttk.Label(frame, text="文件数量:").grid(row=2, column=0, sticky=tk.W, pady=2)
        ttk.Label(frame, text=str(stats["file_count"])).grid(row=2, column=1, sticky=tk.W, pady=2)
        
        ttk.Label(frame, text="缓存命中次数:").grid(row=3, column=0, sticky=tk.W, pady=2)
        ttk.Label(frame, text=str(stats["cache_hits"])).grid(row=3, column=1, sticky=tk.W, pady=2)
        
        ttk.Label(frame, text="缓存未命中次数:").grid(row=4, column=0, sticky=tk.W, pady=2)
        ttk.Label(frame, text=str(stats["cache_misses"])).grid(row=4, column=1, sticky=tk.W, pady=2)
        
        if stats["last_cleanup"]:
            ttk.Label(frame, text="上次清理时间:").grid(row=5, column=0, sticky=tk.W, pady=2)
            ttk.Label(frame, text=stats["last_cleanup"]).grid(row=5, column=1, sticky=tk.W, pady=2)
        
        # 添加操作按钮
        button_frame = ttk.Frame(frame)
        button_frame.grid(row=6, column=0, columnspan=2, pady=20)
        
        ttk.Button(button_frame, text="清理所有缓存", command=lambda: [self.clear_cache(), stats_window.destroy()]).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="清理旧缓存", command=lambda: [self.cleanup_old_cache(7), stats_window.destroy()]).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="关闭", command=stats_window.destroy).pack(side=tk.LEFT, padx=5)
    
    def clear_cache(self, category=None):
        """清理缓存"""
        category_name = "所有" if category is None else category
        if messagebox.askyesno("确认清理", f"确定要清理{category_name}缓存吗？"):
            success = self.cache_manager.clear_cache(category)
            if success:
                self.update_status(f"已成功清理{category_name}缓存")
                messagebox.showinfo("清理成功", f"已成功清理{category_name}缓存")
            else:
                self.update_status("缓存清理失败")
                messagebox.showerror("清理失败", "缓存清理失败，请查看日志")
    
    def cleanup_old_cache(self, days):
        """清理旧缓存"""
        if messagebox.askyesno("确认清理", f"确定要清理{days}天前的旧缓存吗？"):
            cleaned_count, freed_space = self.cache_manager.cleanup_old_cache(days)
            if cleaned_count > 0:
                freed_mb = freed_space / (1024 * 1024)
                self.update_status(f"已清理{cleaned_count}个缓存文件，释放{freed_mb:.2f}MB空间")
                messagebox.showinfo("清理成功", f"已清理{cleaned_count}个缓存文件，释放{freed_mb:.2f}MB空间")
            else:
                self.update_status(f"没有找到{days}天前的旧缓存")
                messagebox.showinfo("清理结果", f"没有找到{days}天前的旧缓存")
    
    def show_help(self):
        """显示帮助信息"""
        help_text = """
MongoDB可视化工具使用帮助

基本操作:
- 连接数据库: 输入MongoDB URI并点击"连接"按钮
- 浏览数据: 在左侧树视图中选择数据库和集合
- 查看文档: 点击网格中的文档卡片
- 编辑文档: 右键点击文档卡片并选择"查看/编辑"

导入功能:
- 导入图片/文件: 使用"文件"菜单中的"导入图片/文件"
- 导入JSON数据: 使用"文件"菜单中的"导入JSON数据"

缓存管理:
- 查看缓存状态: 使用"工具"菜单中的"缓存管理"
- 清理缓存: 可以清理特定类型或所有缓存
- 清理旧缓存: 自动清理指定天数前的缓存文件
        """
        
        help_window = tk.Toplevel(self)
        help_window.title("使用帮助")
        help_window.geometry("600x500")
        help_window.transient(self)
        help_window.grab_set()
        
        text = tk.Text(help_window, wrap=tk.WORD, padx=10, pady=10)
        text.pack(fill=tk.BOTH, expand=True)
        text.insert(tk.END, help_text)
        text.config(state=tk.DISABLED)
        
        ttk.Button(help_window, text="关闭", command=help_window.destroy).pack(pady=10)
    
    def show_about(self):
        """显示关于信息"""
        about_text = """
MongoDB可视化工具

版本: 1.0
描述: 用于查看和管理MongoDB数据库的可视化工具

功能:
- 数据库浏览和查询
- 文档编辑和管理
- 图片和文件导入
- 缓存管理
- 批量操作

作者: Ismism-Machine团队
        """
        
        messagebox.showinfo("关于", about_text)

    def toggle_cache(self):
        """切换缓存启用状态"""
        if self.db_manager:
            enabled = self.cache_enabled.get()
            self.db_manager.set_cache_enabled(enabled)
            status = "启用" if enabled else "禁用"
            self.update_status(f"缓存已{status}")
    
    def navigate_to_target_document(self, target_collection, target_id):
        """导航到目标文档
        
        Args:
            target_collection (str): 目标集合名称
            target_id (str): 目标文档ID
        """
        try:
            # 保存当前DB，这样我们在导航后可以返回
            previous_db = self.current_db
            previous_collection = self.current_collection
            
            # 在树中查找目标集合
            found = False
            db_nodes = self.db_tree.get_children()
            
            for db_node in db_nodes:
                db_name = self.db_tree.item(db_node, "text")
                
                # 获取集合节点
                collection_nodes = self.db_tree.get_children(db_node)
                for coll_node in collection_nodes:
                    coll_name = self.db_tree.item(coll_node, "text")
                    
                    if coll_name == target_collection:
                        # 找到目标集合，选中它
                        self.db_tree.see(coll_node)
                        self.db_tree.selection_set(coll_node)
                        self.db_tree.item(db_node, open=True)  # 确保数据库节点展开
                        
                        # 触发选择事件，加载集合数据
                        self.on_tree_select(None)
                        
                        # 记住我们正在查找的ID
                        self.highlighted_doc_id = target_id
                        
                        # 使用loadDocument会设置highlighted_doc_id
                        self.load_collection_data(target_id)
                        found = True
                        break
                if found:
                    break
            
            if not found:
                messagebox.showinfo("导航", f"未找到目标集合: {target_collection}")
            
        except Exception as e:
            print(f"导航到目标文档失败: {e}")
            import traceback
            traceback.print_exc()
            messagebox.showerror("导航错误", f"导航到目标文档失败: {e}")
    
    def highlight_document(self, doc_id):
        """高亮显示指定ID的文档
        
        Args:
            doc_id (str): 文档ID
        """
        try:
            # 查找文档
            target_doc = None
            target_index = -1
            
            for i, doc in enumerate(self.current_docs):
                doc_id_str = str(doc.get('_id', ''))
                if doc_id_str == doc_id:
                    target_doc = doc
                    target_index = i
                    break
            
            if target_doc:
                # 计算文档在哪一页
                if hasattr(self.paginated_grid, 'items_per_page'):
                    items_per_page = self.paginated_grid.items_per_page
                    target_page = target_index // items_per_page + 1
                    
                    # 跳转到目标页
                    if hasattr(self.paginated_grid, 'current_page') and self.paginated_grid.current_page != target_page:
                        self.paginated_grid.go_to_page(target_page)
                
                # 如果支持选中，选中文档
                highlighted = False
                for card in self.paginated_grid.displayed_cards:
                    card_id = str(card.doc.get('_id', ''))
                    if card_id == doc_id:
                        # 先取消所有选中
                        for c in self.paginated_grid.displayed_cards:
                            if hasattr(c, 'set_selected'):
                                c.set_selected(False)
                        
                        # 高亮目标文档
                        if hasattr(card, 'set_selected'):
                            card.set_selected(True)
                            
                        # 滚动到可见区域
                        if hasattr(card, 'winfo_y') and hasattr(self.paginated_grid, 'canvas'):
                            y_pos = card.winfo_y()
                            self.paginated_grid.canvas.yview_moveto(y_pos / self.paginated_grid.canvas.winfo_height())
                            
                        highlighted = True
                        
                        # 显示文档详情
                        self.show_document_details(target_doc)
                        break
                
                if highlighted:
                    self.update_status(f"已导航到文档: {doc_id}")
                else:
                    self.update_status(f"文档已加载，但无法高亮显示: {doc_id}")
            else:
                self.update_status(f"未找到文档: {doc_id}")
            
            # 重置高亮ID
            self.highlighted_doc_id = None
            
        except Exception as e:
            print(f"高亮文档失败: {e}")
            import traceback
            traceback.print_exc()
            self.update_status(f"高亮文档失败: {e}") 