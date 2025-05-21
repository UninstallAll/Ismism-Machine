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

from ..config.settings import WINDOW_SIZE, DEFAULT_DATABASE
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
        self.paginated_grid = PaginatedGrid(self.right_frame)
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
        if action == "view":
            self.show_document_details(doc)
        elif action == "export":
            self.export_document(doc)
        elif action == "relate":
            self.create_relationship(doc)
        elif action == "delete":
            self.delete_document(doc)
        elif action == "bulk_export":
            self.bulk_export_documents(doc)  # doc is a document list
        elif action == "bulk_relate":
            self.bulk_create_relationships(doc)  # doc is a document list
    
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
        # Create document copy for modification
        json_doc = {}
        
        # Handle special types
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                json_doc[key] = str(value)
            elif isinstance(value, datetime.datetime):
                json_doc[key] = value.isoformat()
            else:
                json_doc[key] = value
        
        # Convert to formatted JSON string
        return json.dumps(json_doc, indent=2, ensure_ascii=False)
    
    def create_relationship(self, doc):
        """Create document relationship
        
        Args:
            doc: Document object
        """
        # If you need to implement this feature, add code here
        messagebox.showinfo("Feature Not Implemented", "Create relationship feature is not yet implemented")
    
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
        # If you need to implement this feature, add code here
        messagebox.showinfo("Feature Not Implemented", "Bulk create relationships feature is not yet implemented")
    
    def delete_document(self, doc):
        """Delete document
        
        Args:
            doc: Document object
        """
        # If you need to implement this feature, add code here
        messagebox.showinfo("Feature Not Implemented", "Delete document feature is not yet implemented")
    
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
        menu.add_command(label="导入词条", command=self.import_entry)
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
        entry = self.simple_input_dialog("导入词条", "请输入词条内容：")
        if not entry:
            return
        doc = {
            "entry": entry,
            "importedAt": datetime.datetime.now()
        }
        try:
            self.db_manager.insert_document(self.current_db, self.current_collection, doc)
            self.update_status("成功导入词条")
            self.load_collection_data()
        except Exception as e:
            messagebox.showerror("导入失败", f"导入词条失败: {e}")

    def simple_input_dialog(self, title, prompt):
        dialog = tk.Toplevel(self)
        dialog.title(title)
        dialog.grab_set()
        tk.Label(dialog, text=prompt).pack(padx=10, pady=10)
        entry_var = tk.StringVar()
        entry = ttk.Entry(dialog, textvariable=entry_var, width=40)
        entry.pack(padx=10, pady=5)
        entry.focus()
        result = {'value': None}
        def on_ok():
            result['value'] = entry_var.get()
            dialog.destroy()
        def on_cancel():
            dialog.destroy()
        btn_frame = ttk.Frame(dialog)
        btn_frame.pack(pady=10)
        ttk.Button(btn_frame, text="确定", command=on_ok).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="取消", command=on_cancel).pack(side=tk.LEFT, padx=5)
        dialog.bind('<Return>', lambda e: on_ok())
        dialog.bind('<Escape>', lambda e: on_cancel())
        self.wait_window(dialog)
        return result['value'] 