#!/usr/bin/env python3
"""
MongoDB Visual Tool - Core Application
"""
import os
import sys
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
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
from .view_settings import ViewSettings
from .collection_views import CollectionViews

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
        
        # Create UI
        self.create_ui()
        
        # Set window close event
        self.protocol("WM_DELETE_WINDOW", self.on_close)
        
        # Auto connect
        if self.user_config.get("auto_connect", True):
            self.after(500, self.auto_connect_mongodb)
    
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
        
        # Right panel - Document viewer
        self.right_frame = ttk.Frame(self.main_pane)
        self.main_pane.add(self.right_frame, weight=3)  # Give right panel more space
        
        # Create paginated grid
        self.paginated_grid = PaginatedGrid(self.right_frame, on_show_details=self.show_document_details)
        self.paginated_grid.pack(fill=tk.BOTH, expand=True)
        self.paginated_grid.set_context_menu_callback(self.handle_context_menu)
        
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
    
    def load_collection_data(self):
        """Load collection data"""
        if not self.current_db or not self.current_collection or not self.db_manager:
            return
        
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
                self.create_relationship(doc)
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
        # Convert BSON document to JSON and display in text box
        json_text = self.bson_to_json(doc)
        self.json_text.delete(1.0, tk.END)
        self.json_text.insert(tk.END, json_text)
    
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
        json_doc = convert(doc)
        return json.dumps(json_doc, indent=2, ensure_ascii=False)
    
    def create_relationship(self, doc):
        """Create document relationship
        
        Args:
            doc: Document object
        """
        if not self.current_db:
            messagebox.showwarning("No Database Selected", "No database is currently selected.")
            return
            
        # Get relationship type
        from ..config.settings import RELATIONSHIP_TYPES
        
        # Create dialog
        dialog = tk.Toplevel(self)
        dialog.title("Create Relationship")
        dialog.grab_set()
        dialog.resizable(False, False)
        
        # Configure frame for the inputs
        main_frame = ttk.Frame(dialog, padding=10)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(main_frame, text="Source Document:").grid(row=0, column=0, sticky=tk.W, pady=5)
        source_label = ttk.Label(main_frame, text=doc.get('filename', str(doc.get('_id', 'Unknown'))))
        source_label.grid(row=0, column=1, sticky=tk.W, pady=5)
        
        ttk.Label(main_frame, text="Relationship Type:").grid(row=1, column=0, sticky=tk.W, pady=5)
        rel_type_var = tk.StringVar()
        rel_type_combo = ttk.Combobox(main_frame, textvariable=rel_type_var, values=RELATIONSHIP_TYPES)
        rel_type_combo.grid(row=1, column=1, sticky=tk.EW, pady=5)
        
        ttk.Label(main_frame, text="Target Collection:").grid(row=2, column=0, sticky=tk.W, pady=5)
        target_coll_var = tk.StringVar()
        collections = self.db_manager.list_collections(self.current_db)
        target_coll_combo = ttk.Combobox(main_frame, textvariable=target_coll_var, values=collections)
        target_coll_combo.grid(row=2, column=1, sticky=tk.EW, pady=5)
        target_coll_combo.bind("<<ComboboxSelected>>", lambda e: load_targets())
        
        ttk.Label(main_frame, text="Target Document:").grid(row=3, column=0, sticky=tk.W, pady=5)
        target_doc_frame = ttk.Frame(main_frame)
        target_doc_frame.grid(row=3, column=1, sticky=tk.EW, pady=5)
        
        target_docs = []
        target_doc_var = tk.StringVar()
        target_doc_combo = ttk.Combobox(target_doc_frame, textvariable=target_doc_var, values=[], width=30)
        target_doc_combo.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        def load_targets():
            """Load target documents"""
            nonlocal target_docs
            coll = target_coll_var.get()
            if coll:
                try:
                    target_docs = self.db_manager.get_documents(self.current_db, coll, limit=100)
                    target_doc_combo['values'] = [doc.get('filename', str(doc.get('_id'))) for doc in target_docs]
                except Exception as e:
                    messagebox.showerror("Error", f"Failed to load target documents: {e}")
        
        # Buttons
        btn_frame = ttk.Frame(dialog)
        btn_frame.pack(fill=tk.X, pady=10)
        
        result = {'success': False}
        
        def on_create():
            """Create relationship"""
            if not rel_type_var.get():
                messagebox.showwarning("Missing Data", "Please select a relationship type.")
                return
                
            if not target_coll_var.get():
                messagebox.showwarning("Missing Data", "Please select a target collection.")
                return
                
            if not target_doc_var.get():
                messagebox.showwarning("Missing Data", "Please select a target document.")
                return
                
            try:
                # Get target document
                target_idx = target_doc_combo.current()
                if target_idx < 0:
                    messagebox.showwarning("Missing Data", "Please select a valid target document.")
                    return
                    
                target_doc = target_docs[target_idx]
                
                # Create relationship document
                rel_doc = {
                    "source_id": doc.get('_id'),
                    "source_collection": self.current_collection,
                    "target_id": target_doc.get('_id'),
                    "target_collection": target_coll_var.get(),
                    "relationship_type": rel_type_var.get(),
                    "created_at": datetime.datetime.now()
                }
                
                # Save relationship to database (in a relationships collection)
                rel_collection = "relationships"
                if rel_collection not in self.db_manager.list_collections(self.current_db):
                    # Create collection if it doesn't exist
                    self.db_manager.insert_document(self.current_db, rel_collection, {"_placeholder": True})
                    
                self.db_manager.insert_document(self.current_db, rel_collection, rel_doc)
                
                result['success'] = True
                messagebox.showinfo("Success", "Relationship created successfully!")
                dialog.destroy()
                
            except Exception as e:
                messagebox.showerror("Error", f"Failed to create relationship: {e}")
        
        ttk.Button(btn_frame, text="Create", command=on_create).pack(side=tk.RIGHT, padx=5)
        ttk.Button(btn_frame, text="Cancel", command=dialog.destroy).pack(side=tk.RIGHT, padx=5)
        
        # Center dialog
        dialog.update_idletasks()
        width = dialog.winfo_width()
        height = dialog.winfo_height()
        x = (dialog.winfo_screenwidth() // 2) - (width // 2)
        y = (dialog.winfo_screenheight() // 2) - (height // 2)
        dialog.geometry(f'{width}x{height}+{x}+{y}')
        
        # Wait for dialog to close
        self.wait_window(dialog)
        
        return result.get('success', False)
    
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
        
        # Create dialog
        dialog = tk.Toplevel(self)
        dialog.title("Bulk Create Relationships")
        dialog.grab_set()
        dialog.resizable(False, False)
        
        # Configure frame for the inputs
        main_frame = ttk.Frame(dialog, padding=10)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(main_frame, text=f"Selected Documents: {len(docs)}").grid(row=0, column=0, columnspan=2, sticky=tk.W, pady=5)
        
        ttk.Label(main_frame, text="Relationship Type:").grid(row=1, column=0, sticky=tk.W, pady=5)
        rel_type_var = tk.StringVar()
        rel_type_combo = ttk.Combobox(main_frame, textvariable=rel_type_var, values=RELATIONSHIP_TYPES)
        rel_type_combo.grid(row=1, column=1, sticky=tk.EW, pady=5)
        
        ttk.Label(main_frame, text="Target Collection:").grid(row=2, column=0, sticky=tk.W, pady=5)
        target_coll_var = tk.StringVar()
        collections = self.db_manager.list_collections(self.current_db)
        target_coll_combo = ttk.Combobox(main_frame, textvariable=target_coll_var, values=collections)
        target_coll_combo.grid(row=2, column=1, sticky=tk.EW, pady=5)
        target_coll_combo.bind("<<ComboboxSelected>>", lambda e: load_targets())
        
        ttk.Label(main_frame, text="Target Document:").grid(row=3, column=0, sticky=tk.W, pady=5)
        target_doc_frame = ttk.Frame(main_frame)
        target_doc_frame.grid(row=3, column=1, sticky=tk.EW, pady=5)
        
        target_docs = []
        target_doc_var = tk.StringVar()
        target_doc_combo = ttk.Combobox(target_doc_frame, textvariable=target_doc_var, values=[], width=30)
        target_doc_combo.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        def load_targets():
            """Load target documents"""
            nonlocal target_docs
            coll = target_coll_var.get()
            if coll:
                try:
                    target_docs = self.db_manager.get_documents(self.current_db, coll, limit=100)
                    target_doc_combo['values'] = [doc.get('filename', str(doc.get('_id'))) for doc in target_docs]
                except Exception as e:
                    messagebox.showerror("Error", f"Failed to load target documents: {e}")
        
        # Buttons
        btn_frame = ttk.Frame(dialog)
        btn_frame.pack(fill=tk.X, pady=10)
        
        result = {'success': False}
        
        def on_create():
            """Create relationships"""
            if not rel_type_var.get():
                messagebox.showwarning("Missing Data", "Please select a relationship type.")
                return
                
            if not target_coll_var.get():
                messagebox.showwarning("Missing Data", "Please select a target collection.")
                return
                
            if not target_doc_var.get():
                messagebox.showwarning("Missing Data", "Please select a target document.")
                return
                
            try:
                # Get target document
                target_idx = target_doc_combo.current()
                if target_idx < 0:
                    messagebox.showwarning("Missing Data", "Please select a valid target document.")
                    return
                    
                target_doc = target_docs[target_idx]
                
                # Create relationship documents
                rel_collection = "relationships"
                if rel_collection not in self.db_manager.list_collections(self.current_db):
                    # Create collection if it doesn't exist
                    self.db_manager.insert_document(self.current_db, rel_collection, {"_placeholder": True})
                
                # Create relationships for each selected document
                successful = 0
                for source_doc in docs:
                    rel_doc = {
                        "source_id": source_doc.get('_id'),
                        "source_collection": self.current_collection,
                        "target_id": target_doc.get('_id'),
                        "target_collection": target_coll_var.get(),
                        "relationship_type": rel_type_var.get(),
                        "created_at": datetime.datetime.now()
                    }
                    
                    # Save to database
                    self.db_manager.insert_document(self.current_db, rel_collection, rel_doc)
                    successful += 1
                
                result['success'] = True
                messagebox.showinfo("Success", f"Created {successful} relationships successfully!")
                dialog.destroy()
                
            except Exception as e:
                messagebox.showerror("Error", f"Failed to create relationships: {e}")
        
        ttk.Button(btn_frame, text="Create", command=on_create).pack(side=tk.RIGHT, padx=5)
        ttk.Button(btn_frame, text="Cancel", command=dialog.destroy).pack(side=tk.RIGHT, padx=5)
        
        # Center dialog
        dialog.update_idletasks()
        width = dialog.winfo_width()
        height = dialog.winfo_height()
        x = (dialog.winfo_screenwidth() // 2) - (width // 2)
        y = (dialog.winfo_screenheight() // 2) - (height // 2)
        dialog.geometry(f'{width}x{height}+{x}+{y}')
        
        # Wait for dialog to close
        self.wait_window(dialog)
        
        return result.get('success', False)
    
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