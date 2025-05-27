#!/usr/bin/env python3
"""
测试关系管理器模块
"""
import os
import sys
import tkinter as tk
from tkinter import ttk

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.core.relationship_manager import RelationshipManager
from src.db.mongo_manager import MongoDBManager
from src.config.settings import RELATIONSHIP_TYPES

class TestApp(tk.Tk):
    """测试应用程序"""
    
    def __init__(self):
        """初始化测试应用"""
        super().__init__()
        
        # 设置窗口标题和大小
        self.title("关系管理器测试")
        self.geometry("800x600")
        
        # 创建测试界面
        self.create_ui()
        
        # 尝试连接数据库
        self.db_manager = None
        self.connect_db()
    
    def create_ui(self):
        """创建测试界面"""
        # 创建顶部控制面板
        control_frame = ttk.Frame(self)
        control_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # 数据库连接输入框
        ttk.Label(control_frame, text="MongoDB URI:").grid(row=0, column=0, sticky=tk.W, padx=5, pady=5)
        self.uri_var = tk.StringVar(value="mongodb://localhost:27017/")
        uri_entry = ttk.Entry(control_frame, textvariable=self.uri_var, width=30)
        uri_entry.grid(row=0, column=1, sticky=tk.EW, padx=5, pady=5)
        
        # 连接按钮
        connect_btn = ttk.Button(control_frame, text="连接", command=self.connect_db)
        connect_btn.grid(row=0, column=2, padx=5, pady=5)
        
        # 数据库和集合选择
        ttk.Label(control_frame, text="数据库:").grid(row=1, column=0, sticky=tk.W, padx=5, pady=5)
        self.db_var = tk.StringVar()
        self.db_combo = ttk.Combobox(control_frame, textvariable=self.db_var, width=20)
        self.db_combo.grid(row=1, column=1, sticky=tk.EW, padx=5, pady=5)
        self.db_combo.bind("<<ComboboxSelected>>", self.on_db_selected)
        
        ttk.Label(control_frame, text="集合:").grid(row=2, column=0, sticky=tk.W, padx=5, pady=5)
        self.coll_var = tk.StringVar()
        self.coll_combo = ttk.Combobox(control_frame, textvariable=self.coll_var, width=20)
        self.coll_combo.grid(row=2, column=1, sticky=tk.EW, padx=5, pady=5)
        self.coll_combo.bind("<<ComboboxSelected>>", self.on_collection_selected)
        
        # 加载文档按钮
        load_btn = ttk.Button(control_frame, text="加载文档", command=self.load_documents)
        load_btn.grid(row=2, column=2, padx=5, pady=5)
        
        # 文档列表框架
        docs_frame = ttk.LabelFrame(self, text="文档列表")
        docs_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 创建列表框
        self.docs_list = tk.Listbox(docs_frame)
        self.docs_list.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.docs_list.bind("<<ListboxSelect>>", self.on_doc_selected)
        
        # 添加滚动条
        scrollbar = ttk.Scrollbar(docs_frame, orient="vertical", command=self.docs_list.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.docs_list.configure(yscrollcommand=scrollbar.set)
        
        # 关系管理器框架
        rel_frame = ttk.LabelFrame(self, text="关系管理器")
        rel_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 创建关系管理器
        self.relationship_manager = RelationshipManager(rel_frame, None)
        
        # 设置关系类型
        self.relationship_manager.set_relationship_types(RELATIONSHIP_TYPES)
        
        # 存储文档列表
        self.documents = []
    
    def connect_db(self):
        """连接数据库"""
        try:
            uri = self.uri_var.get()
            self.db_manager = MongoDBManager(uri)
            self.db_manager.connect()
            
            # 更新关系管理器
            self.relationship_manager.db_manager = self.db_manager
            
            # 获取数据库列表
            databases = self.db_manager.list_databases()
            self.db_combo['values'] = databases
            
            # 自动选择第一个数据库
            if databases:
                self.db_combo.current(0)
                self.on_db_selected()
                
            print(f"成功连接到数据库: {uri}")
        except Exception as e:
            print(f"连接数据库失败: {e}")
    
    def on_db_selected(self, event=None):
        """数据库选择事件处理"""
        db_name = self.db_var.get()
        if not db_name:
            return
            
        try:
            # 更新关系管理器的数据库
            self.relationship_manager.set_current_database(db_name)
            
            # 获取集合列表
            collections = self.db_manager.list_collections(db_name)
            self.coll_combo['values'] = collections
            
            # 自动选择第一个集合
            if collections:
                self.coll_combo.current(0)
                self.on_collection_selected()
                
            print(f"已选择数据库: {db_name}")
        except Exception as e:
            print(f"获取集合列表失败: {e}")
    
    def on_collection_selected(self, event=None):
        """集合选择事件处理"""
        coll_name = self.coll_var.get()
        if not coll_name:
            return
            
        # 更新关系管理器的集合
        self.relationship_manager.set_current_collection(coll_name)
        
        print(f"已选择集合: {coll_name}")
    
    def load_documents(self):
        """加载文档"""
        db_name = self.db_var.get()
        coll_name = self.coll_var.get()
        
        if not db_name or not coll_name:
            print("请先选择数据库和集合")
            return
            
        try:
            # 清空文档列表
            self.docs_list.delete(0, tk.END)
            
            # 加载文档
            self.documents = self.db_manager.get_documents(db_name, coll_name, limit=100)
            
            # 更新列表显示
            for doc in self.documents:
                doc_name = doc.get('filename', doc.get('title', str(doc.get('_id', ''))))
                self.docs_list.insert(tk.END, doc_name)
                
            print(f"已加载 {len(self.documents)} 个文档")
        except Exception as e:
            print(f"加载文档失败: {e}")
    
    def on_doc_selected(self, event=None):
        """文档选择事件处理"""
        selection = self.docs_list.curselection()
        if not selection:
            return
            
        try:
            # 获取选中的文档
            index = selection[0]
            doc = self.documents[index]
            
            # 加载关系
            self.relationship_manager.load_document_relationships(doc)
            
            print(f"已选择文档: {doc.get('filename', doc.get('_id', ''))}")
        except Exception as e:
            print(f"加载文档关系失败: {e}")

if __name__ == "__main__":
    app = TestApp()
    app.mainloop() 