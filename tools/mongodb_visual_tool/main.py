#!/usr/bin/env python3
"""
Ismism-Machine MongoDB可视化工具 - 主程序
"""
import os
import sys
import tkinter as tk
from tkinter import ttk, messagebox
import json

# 添加当前目录到路径
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from modules.config.settings import WINDOW_SIZE, DEFAULT_DATABASE
from modules.config.config_manager import ConfigManager
from modules.db.mongo_manager import MongoDBManager
from modules.db.validator import DataValidator
from modules.ui.paginated_grid import PaginatedGrid
from modules.ui.image_card import ImageCard

# 检查并修复ImageCard类中缺少的方法
if not hasattr(ImageCard, 'bind_select_callback') or not callable(getattr(ImageCard, 'bind_select_callback')):
    print("正在添加bind_select_callback方法...")
    
    def bind_select_callback(self, callback):
        """设置选择状态改变时的回调函数
        
        Args:
            callback (callable): 当选择状态改变时调用的函数
        """
        self.on_select_callback = callback
    
    # 添加方法
    setattr(ImageCard, 'bind_select_callback', bind_select_callback)

class MongoDBViewer(tk.Tk):
    """MongoDB Visual Tool Main Application"""
    
    def __init__(self):
        """初始化应用程序"""
        super().__init__()
        
        # 设置窗口标题和大小
        self.title("Ismism-Machine MongoDB Visual Tool")
        self.geometry(WINDOW_SIZE)
        
        # 加载用户配置
        self.user_config = ConfigManager.load_config()
        
        # 数据库连接
        self.db_manager = None
        self.current_docs = []
        
        # 创建UI
        self.create_ui()
        
        # 设置窗口关闭事件
        self.protocol("WM_DELETE_WINDOW", self.on_close)
        
        # 自动连接
        if self.user_config.get("auto_connect", True):
            self.after(500, self.auto_connect_mongodb)
    
    def create_ui(self):
        """创建用户界面"""
        # 主分隔窗格
        self.main_pane = ttk.PanedWindow(self, orient=tk.HORIZONTAL)
        self.main_pane.pack(fill=tk.BOTH, expand=True)
        
        # 左侧面板 - 数据库浏览器
        self.left_frame = ttk.Frame(self.main_pane)
        self.main_pane.add(self.left_frame)
        
        # 连接设置
        conn_frame = ttk.LabelFrame(self.left_frame, text="Connection Settings")
        conn_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(conn_frame, text="MongoDB URI:").pack(anchor=tk.W, padx=5)
        self.uri_entry = ttk.Entry(conn_frame)
        self.uri_entry.insert(0, self.user_config.get("mongodb_uri", "mongodb://localhost:27017/"))
        self.uri_entry.pack(fill=tk.X, padx=5, pady=2)
        
        # 自动连接选项
        self.auto_connect_var = tk.BooleanVar(value=self.user_config.get("auto_connect", True))
        self.auto_connect_checkbox = ttk.Checkbutton(
            conn_frame,
            text="Auto-connect on startup",
            variable=self.auto_connect_var
        )
        self.auto_connect_checkbox.pack(anchor=tk.W, padx=5, pady=2)
        
        connect_button = ttk.Button(conn_frame, text="Connect", command=self.connect_mongodb)
        connect_button.pack(fill=tk.X, padx=5, pady=5)
        
        # 数据库和集合树视图
        tree_frame = ttk.LabelFrame(self.left_frame, text="Databases and Collections")
        tree_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        self.db_tree = ttk.Treeview(tree_frame)
        self.db_tree.pack(fill=tk.BOTH, expand=True)
        self.db_tree.bind("<<TreeviewSelect>>", self.on_tree_select)
        
        # 状态栏
        self.status_var = tk.StringVar(value="Ready")
        self.status_bar = ttk.Label(self.left_frame, textvariable=self.status_var, relief=tk.SUNKEN, anchor=tk.W)
        self.status_bar.pack(fill=tk.X, padx=5, pady=5)
        
        # 右侧面板 - 文档查看器
        self.right_frame = ttk.Frame(self.main_pane)
        self.main_pane.add(self.right_frame, weight=3)  # 给右侧面板更多空间
        
        # 创建分页网格
        self.paginated_grid = PaginatedGrid(self.right_frame)
        self.paginated_grid.pack(fill=tk.BOTH, expand=True)
        self.paginated_grid.set_context_menu_callback(self.handle_context_menu)
        
        # 底部面板 - JSON查看器
        self.json_frame = ttk.LabelFrame(self, text="Document Details")
        self.json_frame.pack(fill=tk.BOTH, padx=5, pady=5, expand=False)
        
        self.json_text = tk.Text(self.json_frame, wrap=tk.WORD, height=10)
        self.json_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
    
    def auto_connect_mongodb(self):
        """自动连接到MongoDB"""
        try:
            uri = self.uri_entry.get()
            self.update_status(f"正在自动连接到 {uri}...")
            
            # 创建数据库管理器
            self.db_manager = MongoDBManager(uri)
            self.db_manager.connect()
            
            self.update_status("Successfully connected to MongoDB")
            self.populate_db_tree()
            
            # 记住上次选择的数据库和集合
            last_db = self.user_config.get("last_db", "")
            last_collection = self.user_config.get("last_collection", "")
            
            if last_db:
                # 查找并选择数据库节点
                for db_id in self.db_tree.get_children():
                    if self.db_tree.item(db_id, "text") == last_db:
                        self.db_tree.selection_set(db_id)
                        self.db_tree.see(db_id)
                        self.db_tree.item(db_id, open=True)  # 展开数据库节点
                        
                        # 如果有上次选择的集合，查找并选择集合节点
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
            self.update_status(f"自动连接失败: {str(e)}")
            messagebox.showerror("Auto-connection Error", f"无法自动连接到MongoDB: {str(e)}")
    
    def connect_mongodb(self):
        """手动连接到MongoDB"""
        uri = self.uri_entry.get()
        try:
            self.update_status(f"正在连接到 {uri}...")
            
            # 创建数据库管理器
            self.db_manager = MongoDBManager(uri)
            self.db_manager.connect()
            
            self.update_status("Successfully connected to MongoDB")
            messagebox.showinfo("Connect", "Successfully connected to MongoDB")
            
            # 更新配置
            self.user_config["mongodb_uri"] = uri
            self.user_config["auto_connect"] = self.auto_connect_var.get()
            ConfigManager.save_config(self.user_config)
            
            # 填充数据库树
            self.populate_db_tree()
            
        except Exception as e:
            self.update_status(f"连接失败: {str(e)}")
            messagebox.showerror("Connection Error", f"无法连接到MongoDB: {str(e)}")
    
    def populate_db_tree(self):
        """填充数据库树视图"""
        # 清除现有内容
        self.db_tree.delete(*self.db_tree.get_children())
        
        if self.db_manager is None:
            return
            
        try:
            # 获取数据库列表
            databases = self.db_manager.list_databases()
            
            # 添加数据库到树视图
            for db_name in databases:
                db_node = self.db_tree.insert("", "end", text=db_name, open=False, tags=("database",))
                
                # 获取集合列表
                collections = self.db_manager.list_collections(db_name)
                
                # 添加集合到树视图
                for coll_name in collections:
                    self.db_tree.insert(db_node, "end", text=coll_name, tags=("collection",))
                    
        except Exception as e:
            self.update_status(f"填充数据库树失败: {str(e)}")
            messagebox.showerror("错误", f"获取数据库列表失败: {str(e)}")
    
    def on_tree_select(self, event):
        """处理树节点选择事件"""
        selection = self.db_tree.selection()
        if not selection:
            return
            
        item = selection[0]
        parent = self.db_tree.parent(item)
        
        if parent:  # 如果有父节点，则为集合
            db_name = self.db_tree.item(parent, "text")
            collection_name = self.db_tree.item(item, "text")
            
            # 更新配置
            self.user_config["last_db"] = db_name
            self.user_config["last_collection"] = collection_name
            ConfigManager.save_config(self.user_config)
            
            # 加载集合数据
            self.load_collection_data(db_name, collection_name)
        else:  # 否则为数据库
            db_name = self.db_tree.item(item, "text")
            
            # 更新配置
            self.user_config["last_db"] = db_name
            self.user_config["last_collection"] = ""
            ConfigManager.save_config(self.user_config)
            
            # 更新状态
            self.update_status(f"已选择数据库: {db_name}")
    
    def load_collection_data(self, db_name, collection_name):
        """加载集合数据"""
        if self.db_manager is None:
            return
            
        try:
            self.update_status(f"正在加载 {db_name}.{collection_name}...")
            
            # 设置当前数据库和集合
            self.db_manager.set_database(db_name)
            self.db_manager.set_collection(collection_name)
            
            # 获取文档
            docs = self.db_manager.get_documents()
            
            # 验证文档文件
            image_root_path = os.path.join(os.path.dirname(current_dir), "public/images")
            validated_docs, inconsistencies = DataValidator.validate_documents_with_files(docs, image_root_path, True)
            
            # 记录不一致性问题
            if inconsistencies:
                DataValidator.log_inconsistencies(inconsistencies)
                messagebox.showwarning("警告", f"发现 {len(inconsistencies)} 个数据与文件不一致的问题。详情请查看日志。")
                
            # 更新UI
            self.current_docs = validated_docs
            self.update_grid_with_docs(validated_docs)
            
            # 更新状态
            self.update_status(f"已加载 {len(validated_docs)} 个文档，来自 {db_name}.{collection_name}")
            
        except Exception as e:
            self.update_status(f"加载集合数据失败: {str(e)}")
            messagebox.showerror("错误", f"无法加载集合数据: {str(e)}")
            
    def update_grid_with_docs(self, docs):
        """更新网格视图显示文档"""
        if hasattr(self, 'paginated_grid'):
            self.paginated_grid.set_items(docs)
    
    def update_status(self, message):
        """更新状态栏"""
        self.status_var.set(message)
        self.update_idletasks()
    
    def handle_context_menu(self, action, doc, event=None):
        """处理上下文菜单动作
        
        Args:
            action (str): 动作类型，如"view"，"relate"等
            doc (dict): 文档数据或文档列表
            event: 事件对象（可选）
        """
        if action == "context_menu":
            # 这是卡片上的右键菜单事件，需要创建并显示菜单
            if not hasattr(self, 'context_menu'):
                self.context_menu = tk.Menu(self, tearoff=0)
                self.context_menu.add_command(label="View Details", command=lambda: self.show_document_details(doc))
                self.context_menu.add_command(label="Create Relationship", command=lambda: self.create_relationship(doc))
                self.context_menu.add_command(label="Export JSON", command=lambda: self.export_document(doc))
                self.context_menu.add_separator()
                self.context_menu.add_command(label="Delete", command=lambda: self.delete_document(doc), foreground="red")
            else:
                # 更新现有菜单的命令
                self.context_menu.entryconfig(0, command=lambda: self.show_document_details(doc))
                self.context_menu.entryconfig(1, command=lambda: self.create_relationship(doc))
                self.context_menu.entryconfig(2, command=lambda: self.export_document(doc))
                self.context_menu.entryconfig(4, command=lambda: self.delete_document(doc))
            
            # 显示菜单
            try:
                if event:
                    self.context_menu.tk_popup(event.x_root, event.y_root)
            finally:
                # 确保释放菜单
                self.context_menu.grab_release()
        elif action == "view":
            self.show_document_details(doc)
        elif action == "relate":
            self.create_relationship(doc)
        elif action == "export":
            self.export_document(doc)
        elif action == "delete":
            self.delete_document(doc)
        elif action == "bulk_export":
            self.bulk_export_documents(doc)  # 这里doc实际上是文档列表
        elif action == "create_relation":
            self.bulk_create_relationships(doc)  # 这里doc实际上是文档列表
    
    def show_document_details(self, doc):
        """显示文档详细信息"""
        if not doc:
            return
            
        json_text = json.dumps(self.bson_to_json(doc), indent=2, ensure_ascii=False)
        self.json_text.delete(1.0, tk.END)
        self.json_text.insert(tk.END, json_text)
    
    def bson_to_json(self, doc):
        """将BSON文档转换为JSON可序列化的字典"""
        result = {}
        for key, value in doc.items():
            if key.startswith('_') and key != '_id':
                continue  # 跳过内部字段
                
            if key == '_id':
                result[key] = str(value)
            elif isinstance(value, dict):
                result[key] = self.bson_to_json(value)
            elif isinstance(value, list):
                result[key] = [self.bson_to_json(item) if isinstance(item, dict) else item for item in value]
            else:
                result[key] = value
                
        return result
    
    def create_relationship(self, doc):
        """创建文档关系"""
        messagebox.showinfo("功能提示", "关系创建功能尚未实现")
        
    def export_document(self, doc):
        """导出文档"""
        messagebox.showinfo("功能提示", "导出功能尚未实现")
        
    def delete_document(self, doc):
        """删除文档"""
        messagebox.showinfo("功能提示", "删除功能尚未实现")
        
    def bulk_export_documents(self, docs):
        """批量导出文档"""
        messagebox.showinfo("功能提示", "批量导出功能尚未实现")
        
    def bulk_create_relationships(self, docs):
        """批量创建关系"""
        messagebox.showinfo("功能提示", "批量创建关系功能尚未实现")
    
    def on_close(self):
        """处理窗口关闭事件"""
        try:
            # 保存配置
            self.user_config["auto_connect"] = self.auto_connect_var.get()
            self.user_config["mongodb_uri"] = self.uri_entry.get()
            ConfigManager.save_config(self.user_config)
            
            # 关闭数据库连接
            if self.db_manager is not None:
                self.db_manager.close()
                
        except Exception as e:
            print(f"关闭时发生错误: {str(e)}")
            
        # 销毁窗口
        self.destroy()

def main():
    """主函数"""
    app = MongoDBViewer()
    app.mainloop()

if __name__ == "__main__":
    main()
