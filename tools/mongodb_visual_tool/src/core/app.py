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
        
        self.db_tree = ttk.Treeview(tree_frame)
        self.db_tree.pack(fill=tk.BOTH, expand=True)
        self.db_tree.bind("<<TreeviewSelect>>", self.on_tree_select)
        
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
        """Handle tree node selection event"""
        selection = self.db_tree.selection()
        if not selection:
            return
            
        item = selection[0]
        parent = self.db_tree.parent(item)
        
        if parent:  # If has parent, it's a collection
            db_name = self.db_tree.item(parent, "text")
            collection_name = self.db_tree.item(item, "text")
            
            # Update configuration
            self.user_config["last_db"] = db_name
            self.user_config["last_collection"] = collection_name
            ConfigManager.save_config(self.user_config)
            
            # Record current selected database and collection
            self.current_db = db_name
            self.current_collection = collection_name
            
            # Get collection schema and update UI
            self.update_collection_schema()
            
            # Load collection data
            self.load_collection_data()
        else:  # Otherwise it's a database
            db_name = self.db_tree.item(item, "text")
            
            # Update configuration
            self.user_config["last_db"] = db_name
            self.user_config["last_collection"] = ""
            ConfigManager.save_config(self.user_config)
            
            # Record current selected database
            self.current_db = db_name
            self.current_collection = None
    
    def update_collection_schema(self):
        """获取并更新集合的字段结构"""
        if not self.current_db or not self.current_collection:
            return
            
        try:
            # 获取集合的验证规则
            collection_info = self.db_manager.get_collection_info(self.current_db, self.current_collection)
            validation = collection_info.get('options', {}).get('validator', {})
            
            if validation:
                # 存储当前集合的字段结构，供其他功能使用
                self.current_schema = validation.get('$jsonSchema', {})
                print(f"[DEBUG] Current schema: {self.current_schema}")
                # 更新UI显示
                self.paginated_grid.set_schema(self.current_schema)
            else:
                self.current_schema = None
                self.paginated_grid.set_schema(None)
        except Exception as e:
            print(f"[DEBUG] Failed to get collection schema: {e}")
            self.current_schema = None
            self.paginated_grid.set_schema(None)
    
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
            valid_docs, inconsistencies = DataValidator.validate_documents_with_files(docs)
            
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
        valid_docs = []
        inconsistencies = []
        
        for doc in docs:
            # Copy document to avoid modifying original data
            doc_copy = dict(doc)
            
            # Check file path
            file_missing = False
            file_path = None
            
            # Extract file path
            if 'filePath' in doc:
                file_path = doc['filePath']
            elif 'imageUrl' in doc:
                file_path = doc['imageUrl']
                
            # Check if file exists
            if file_path:
                if not os.path.exists(file_path):
                    file_missing = True
                    inconsistencies.append({
                        'document_id': str(doc.get('_id')),
                        'issue': 'file_missing',
                        'path': file_path
                    })
            
            # Mark file missing
            if file_missing:
                doc_copy['_file_missing'] = True
                
            valid_docs.append(doc_copy)
            
        return valid_docs, inconsistencies
    
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
        if not self.current_db or not self.current_collection:
            messagebox.showwarning("No Collection Selected", "No collection is currently selected.")
            return
            
        # Confirm deletion
        confirm = messagebox.askyesno("Confirm Deletion", 
                                     f"Are you sure you want to delete this document?\n\n" +
                                     f"Filename: {doc.get('filename', 'Unknown')}\n" +
                                     f"ID: {doc.get('_id', 'Unknown')}")
        if not confirm:
            return
            
        try:
            # Delete document from database
            success = self.db_manager.delete_document(
                self.current_db, 
                self.current_collection,
                str(doc.get('_id'))
            )
            
            if success:
                self.update_status(f"Document deleted successfully")
                messagebox.showinfo("Delete Successful", "Document has been deleted successfully.")
                
                # Refresh collection data
                self.load_collection_data()
            else:
                self.update_status("Failed to delete document")
                messagebox.showerror("Delete Failed", "Failed to delete the document.")
        except Exception as e:
            self.update_status(f"Delete failed: {str(e)}")
            messagebox.showerror("Delete Error", f"Failed to delete document: {str(e)}")
    
    def delete_documents(self, docs):
        """Delete multiple documents and their associated files"""
        print(f"[DEBUG] Entering delete_documents. Docs count: {len(docs)}")
        if not self.current_db or not self.current_collection:
            messagebox.showwarning("未选择集合", "请先在左侧选择目标数据库和集合！")
            print("[DEBUG] No database or collection selected.")
            return
        if not docs:
            print("[DEBUG] Docs list is empty.")
            return
        # 确认
        confirm = messagebox.askyesno(
            "Confirm Deletion",
            f"Are you sure you want to delete {len(docs)} documents?\n\n" +
            "\n".join([str(doc.get('filename', doc.get('_id', 'Unknown'))) for doc in docs[:5]]) +
            ("\n..." if len(docs) > 5 else "")
        )
        if not confirm:
            return
        success_count = 0
        failed_docs = []
        for doc in docs:
            print(f"[DEBUG] Processing doc: {doc.get('_id')}")
            print(f"[DEBUG] Doc content: {doc}")
            try:
                ok = self.db_manager.delete_document(
                    self.current_db,
                    self.current_collection,
                    str(doc.get('_id'))
                )
                if ok:
                    success_count += 1
            except Exception as e:
                print(f"Delete failed: {doc.get('_id')}, {e}")
                failed_docs.append(doc)
        if success_count:
            self.update_status(f"Deleted {success_count} documents successfully")
            messagebox.showinfo("Delete Successful", f"Deleted {success_count} documents successfully.")
            self.load_collection_data()
        else:
            self.update_status("Failed to delete documents")
            messagebox.showerror("Delete Failed", "Failed to delete the selected documents.")
    
    def on_close(self):
        """Handle window close event"""
        # Save current configuration
        self.user_config["auto_connect"] = self.auto_connect_var.get()
        ConfigManager.save_config(self.user_config)
        
        # Destroy window
        self.destroy()

    # --- 新增：导入菜单和处理逻辑 ---
    def show_import_menu(self):
        menu = tk.Menu(self, tearoff=0)
        menu.add_command(label="导入图片", command=self.import_images)
        menu.add_command(label="添加词条", command=self.import_entry)
        menu.add_command(label="批量导入词条", command=self.import_entries_from_json)
        try:
            menu.tk_popup(self.winfo_pointerx(), self.winfo_pointery())
        finally:
            menu.grab_release()

    def import_images(self):
        if not self.current_db or not self.current_collection:
            messagebox.showwarning("未选择集合", "请先在左侧选择目标数据库和集合！")
            return
        file_paths = filedialog.askopenfilenames(
            title="选择图片文件",
            filetypes=[("图片文件", "*.png;*.jpg;*.jpeg;*.bmp;*.gif"), ("所有文件", "*.*")]
        )
        if not file_paths:
            return
        inserted = 0
        for path in file_paths:
            doc = {
                "filePath": path,
                "filename": os.path.basename(path),
                "size": os.path.getsize(path),
                "importedAt": datetime.datetime.now()
            }
            try:
                self.db_manager.insert_document(self.current_db, self.current_collection, doc)
                inserted += 1
            except Exception as e:
                print(f"导入失败: {path}, 错误: {e}")
        self.update_status(f"成功导入{inserted}张图片")
        self.load_collection_data()

    def import_entry(self):
        if not self.current_db or not self.current_collection:
            messagebox.showwarning("未选择集合", "请先在左侧选择目标数据库和集合！")
            return
        dialog = tk.Toplevel(self)
        dialog.title("添加词条")
        dialog.grab_set()
        dialog.resizable(False, False)
        
        main_frame = ttk.Frame(dialog, padding=10)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(main_frame, text="词条内容:").pack(padx=10, pady=(10,5))
        entry_text = tk.Text(main_frame, width=40, height=5)
        entry_text.pack(padx=10, pady=5)
        entry_text.focus()
        
        btn_frame = ttk.Frame(main_frame)
        btn_frame.pack(pady=10)
        
        def on_ok():
            content = entry_text.get("1.0", tk.END).strip()
            if not content:
                return
            doc = {
                "entry": content,
                "importedAt": datetime.datetime.now()
            }
            try:
                self.db_manager.insert_document(self.current_db, self.current_collection, doc)
                self.update_status("成功添加词条")
                self.load_collection_data()
                dialog.destroy()
            except Exception as e:
                messagebox.showerror("添加失败", f"添加词条失败: {e}")
        
        def on_cancel():
            dialog.destroy()
        
        ttk.Button(btn_frame, text="确定", command=on_ok).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="取消", command=on_cancel).pack(side=tk.LEFT, padx=5)
        
        dialog.bind('<Escape>', lambda e: on_cancel())
        
        # 居中显示对话框
        dialog.update_idletasks()
        width = dialog.winfo_width()
        height = dialog.winfo_height()
        x = (dialog.winfo_screenwidth() // 2) - (width // 2)
        y = (dialog.winfo_screenheight() // 2) - (height // 2)
        dialog.geometry(f'{width}x{height}+{x}+{y}')
        
        self.wait_window(dialog)

    def import_entries_from_json(self):
        """从JSON文件批量导入词条"""
        if not self.current_db or not self.current_collection:
            messagebox.showwarning("未选择集合", "请先在左侧选择目标数据库和集合！")
            return
            
        file_path = filedialog.askopenfilename(
            title="选择JSON文件",
            filetypes=[("JSON文件", "*.json"), ("所有文件", "*.*")]
        )
        
        if not file_path:
            return
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                entries = json.load(f)
            
            if not isinstance(entries, (list, dict)):
                messagebox.showerror("格式错误", "JSON文件格式不正确，应为数组或对象格式")
                return
                
            # 如果是字典，转换为列表
            if isinstance(entries, dict):
                entries = [entries]
                
            # 添加导入时间
            for entry in entries:
                if isinstance(entry, (str, int, float)):
                    # 如果是基本类型，转换为词条对象
                    entry = {"entry": str(entry)}
                entry["importedAt"] = datetime.datetime.now()
                
            # 批量插入
            result = self.db_manager.insert_many(self.current_db, self.current_collection, entries)
            
            if result:
                messagebox.showinfo("导入成功", f"成功导入 {len(entries)} 个词条")
                self.load_collection_data()
            else:
                messagebox.showerror("导入失败", "导入过程中发生错误")
                
        except json.JSONDecodeError:
            messagebox.showerror("格式错误", "JSON文件格式不正确")
        except Exception as e:
            messagebox.showerror("导入失败", f"导入词条失败: {e}") 