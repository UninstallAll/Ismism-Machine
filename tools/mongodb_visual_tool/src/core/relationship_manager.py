#!/usr/bin/env python3
"""
MongoDB Visual Tool - Relationship Manager Module
用于管理文档之间的关系的独立模块
"""
import tkinter as tk
from tkinter import ttk, messagebox
import datetime
from bson.objectid import ObjectId

class RelationshipManager:
    """关系管理器类，处理文档之间的关系管理"""
    
    def __init__(self, parent, db_manager, on_relationship_change=None):
        """初始化关系管理器
        
        Args:
            parent: 父容器组件
            db_manager: 数据库管理器实例
            on_relationship_change: 关系变更时的回调函数
        """
        self.parent = parent
        self.db_manager = db_manager
        self.on_relationship_change = on_relationship_change
        
        # 当前状态
        self.current_db = None
        self.current_collection = None
        self.current_doc = None
        self.relationship_types = []
        self._rel_target_docs = []  # 临时存储目标文档列表
        
        # 创建UI
        self._create_ui()
    
    def _create_ui(self):
        """创建关系管理UI"""
        # 顶部标题
        ttk.Label(self.parent, text="关系管理", font=("Helvetica", 12, "bold")).pack(fill=tk.X, padx=10, pady=10)
        
        # 现有关系展示区域
        rel_display_frame = ttk.LabelFrame(self.parent, text="现有关系")
        rel_display_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # 创建关系列表
        columns = ("关系类型", "目标集合", "目标文档")
        self.rel_tree = ttk.Treeview(rel_display_frame, columns=columns, show="headings", height=10)
        
        # 设置列标题
        for col in columns:
            self.rel_tree.heading(col, text=col)
            self.rel_tree.column(col, width=100)
        
        # 添加滚动条
        rel_scrollbar = ttk.Scrollbar(rel_display_frame, orient="vertical", command=self.rel_tree.yview)
        self.rel_tree.configure(yscrollcommand=rel_scrollbar.set)
        
        # 布局关系列表和滚动条
        self.rel_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        rel_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # 添加关系的操作区域
        add_rel_frame = ttk.LabelFrame(self.parent, text="添加关系")
        add_rel_frame.pack(fill=tk.X, padx=5, pady=5)
        
        # 关系类型选择
        ttk.Label(add_rel_frame, text="关系类型:").grid(row=0, column=0, sticky=tk.W, padx=5, pady=5)
        self.rel_type_var = tk.StringVar()
        self.rel_type_combo = ttk.Combobox(add_rel_frame, textvariable=self.rel_type_var, values=[], width=20)
        self.rel_type_combo.grid(row=0, column=1, sticky=tk.EW, padx=5, pady=5)
        
        # 目标集合选择
        ttk.Label(add_rel_frame, text="目标集合:").grid(row=1, column=0, sticky=tk.W, padx=5, pady=5)
        self.rel_target_coll_var = tk.StringVar()
        self.rel_target_coll_combo = ttk.Combobox(add_rel_frame, textvariable=self.rel_target_coll_var, width=20)
        self.rel_target_coll_combo.grid(row=1, column=1, sticky=tk.EW, padx=5, pady=5)
        self.rel_target_coll_combo.bind("<<ComboboxSelected>>", self._load_target_docs)
        
        # 目标文档选择
        ttk.Label(add_rel_frame, text="目标文档:").grid(row=2, column=0, sticky=tk.W, padx=5, pady=5)
        self.rel_target_doc_var = tk.StringVar()
        self.rel_target_doc_combo = ttk.Combobox(add_rel_frame, textvariable=self.rel_target_doc_var, width=20)
        self.rel_target_doc_combo.grid(row=2, column=1, sticky=tk.EW, padx=5, pady=5)
        
        # 按钮区域
        btn_frame = ttk.Frame(self.parent)
        btn_frame.pack(fill=tk.X, padx=5, pady=10)
        
        # 添加关系按钮
        self.add_rel_btn = ttk.Button(btn_frame, text="添加关系", command=self.add_relationship)
        self.add_rel_btn.pack(side=tk.LEFT, padx=5)
        
        # 删除关系按钮
        self.del_rel_btn = ttk.Button(btn_frame, text="删除关系", command=self.delete_relationship)
        self.del_rel_btn.pack(side=tk.LEFT, padx=5)
        
        # 刷新关系按钮
        self.refresh_rel_btn = ttk.Button(btn_frame, text="刷新关系", command=self.refresh_relationships)
        self.refresh_rel_btn.pack(side=tk.LEFT, padx=5)
    
    def set_relationship_types(self, types):
        """设置关系类型列表
        
        Args:
            types (list): 关系类型列表
        """
        self.relationship_types = types
        self.rel_type_combo['values'] = types
    
    def set_current_database(self, db_name):
        """设置当前数据库
        
        Args:
            db_name (str): 数据库名称
        """
        self.current_db = db_name
        if self.db_manager and db_name:
            collections = self.db_manager.list_collections(db_name)
            self.rel_target_coll_combo['values'] = collections
    
    def set_current_collection(self, collection_name):
        """设置当前集合
        
        Args:
            collection_name (str): 集合名称
        """
        self.current_collection = collection_name
    
    def load_document_relationships(self, doc):
        """加载文档的关系
        
        Args:
            doc: 文档对象
        """
        if not self.current_db or not doc:
            return
        
        # 更新当前文档
        self.current_doc = doc
        
        # 清空关系树
        self.rel_tree.delete(*self.rel_tree.get_children())
        
        try:
            # 查询当前文档作为源的关系
            rel_collection = "relationships"
            if rel_collection not in self.db_manager.list_collections(self.current_db):
                return
            
            # 查询关系
            doc_id = doc.get('_id')
            if not doc_id:
                return
                
            # 将ObjectId转换为字符串用于查询
            if isinstance(doc_id, ObjectId):
                source_id_str = str(doc_id)
            else:
                source_id_str = doc_id
                
            # 查询关系 - 使用字符串ID
            relationships = self.db_manager.get_documents(
                self.current_db,
                "relationships",
                query={"source_id": source_id_str}
            )
            
            # 更新关系树
            for rel in relationships:
                target_coll = rel.get('target_collection', '')
                target_id = rel.get('target_id', '')
                
                # 获取目标文档信息
                target_doc_name = str(target_id)
                try:
                    # 尝试将target_id转换回ObjectId用于查询
                    query_id = target_id
                    try:
                        if not isinstance(target_id, ObjectId) and ObjectId.is_valid(target_id):
                            query_id = ObjectId(target_id)
                    except:
                        query_id = target_id
                        
                    target_doc = self.db_manager.get_documents(
                        self.current_db,
                        target_coll,
                        query={"_id": query_id}
                    )
                    if target_doc and len(target_doc) > 0:
                        target_doc_name = target_doc[0].get('filename', target_doc[0].get('title', str(target_id)))
                except Exception as e:
                    print(f"获取目标文档失败: {e}")
                
                # 添加到关系树
                self.rel_tree.insert("", "end", values=(
                    rel.get('relationship_type', ''),
                    target_coll,
                    target_doc_name
                ), tags=(str(rel.get('_id')),))
        except Exception as e:
            print(f"加载关系失败: {e}")
            messagebox.showerror("错误", f"加载关系失败: {e}")
    
    def _load_target_docs(self, event=None):
        """加载目标集合中的文档"""
        if not self.current_db:
            return
            
        target_coll = self.rel_target_coll_var.get()
        if not target_coll:
            return
            
        try:
            # 获取目标集合中的文档
            target_docs = self.db_manager.get_documents(self.current_db, target_coll, limit=100)
            
            # 更新目标文档下拉框
            self.rel_target_doc_combo['values'] = [
                doc.get('filename', doc.get('title', str(doc.get('_id', '')))) 
                for doc in target_docs
            ]
            
            # 保存目标文档列表以供后续使用
            self._rel_target_docs = target_docs
        except Exception as e:
            print(f"加载目标文档失败: {e}")
            messagebox.showerror("错误", f"加载目标文档失败: {e}")
    
    def add_relationship(self):
        """添加关系"""
        if not self.current_db or not self.current_collection or not self.current_doc:
            messagebox.showwarning("未选择文档", "请先选择源文档")
            return
            
        rel_type = self.rel_type_var.get()
        target_coll = self.rel_target_coll_var.get()
        target_doc_name = self.rel_target_doc_var.get()
        
        if not rel_type:
            messagebox.showwarning("缺少关系类型", "请选择关系类型")
            return
            
        if not target_coll:
            messagebox.showwarning("缺少目标集合", "请选择目标集合")
            return
            
        if not target_doc_name:
            messagebox.showwarning("缺少目标文档", "请选择目标文档")
            return
            
        try:
            # 获取目标文档
            target_idx = self.rel_target_doc_combo.current()
            if target_idx < 0 or not hasattr(self, '_rel_target_docs') or target_idx >= len(self._rel_target_docs):
                messagebox.showwarning("无效目标", "请选择有效的目标文档")
                return
                
            target_doc = self._rel_target_docs[target_idx]
            
            # 创建关系文档 - 将ObjectId转换为字符串
            source_id = self.current_doc.get('_id')
            target_id = target_doc.get('_id')
            
            # 确保ObjectId被转换为字符串
            if isinstance(source_id, ObjectId):
                source_id = str(source_id)
            if isinstance(target_id, ObjectId):
                target_id = str(target_id)
                
            rel_doc = {
                "source_id": source_id,
                "source_collection": self.current_collection,
                "target_id": target_id,
                "target_collection": target_coll,
                "relationship_type": rel_type,
                "created_at": datetime.datetime.now()
            }
            
            # 保存关系到数据库
            rel_collection = "relationships"
            if rel_collection not in self.db_manager.list_collections(self.current_db):
                self.db_manager.insert_document(self.current_db, rel_collection, {"_placeholder": True})
                
            self.db_manager.insert_document(self.current_db, rel_collection, rel_doc)
            
            # 刷新关系显示
            self.load_document_relationships(self.current_doc)
            
            # 触发回调
            if self.on_relationship_change:
                self.on_relationship_change()
                
            messagebox.showinfo("成功", "关系创建成功")
        except Exception as e:
            print(f"创建关系失败: {e}")
            messagebox.showerror("创建关系失败", f"创建关系时出错: {e}")
    
    def delete_relationship(self):
        """删除关系"""
        selected = self.rel_tree.selection()
        if not selected:
            messagebox.showwarning("未选择关系", "请先选择要删除的关系")
            return
            
        if not self.current_db:
            return
            
        try:
            # 确认删除
            if not messagebox.askyesno("确认删除", "确定要删除所选关系吗？"):
                return
                
            # 获取关系ID
            rel_id = self.rel_tree.item(selected[0], "tags")[0]
            
            # 尝试将字符串ID转换为ObjectId
            try:
                if ObjectId.is_valid(rel_id):
                    rel_id = ObjectId(rel_id)
            except:
                # 如果转换失败，保持原样
                pass
                
            # 删除关系
            self.db_manager.delete_document(self.current_db, "relationships", rel_id)
            
            # 刷新关系显示
            if self.current_doc:
                self.load_document_relationships(self.current_doc)
            
            # 触发回调
            if self.on_relationship_change:
                self.on_relationship_change()
                
            messagebox.showinfo("成功", "关系已删除")
        except Exception as e:
            print(f"删除关系失败: {e}")
            messagebox.showerror("删除失败", f"删除关系时出错: {e}")
    
    def refresh_relationships(self):
        """刷新关系显示"""
        if self.current_doc:
            self.load_document_relationships(self.current_doc)
    
    def bulk_create_relationships(self, docs):
        """批量创建关系
        
        Args:
            docs (list): 文档列表
            
        Returns:
            bool: 操作是否成功
        """
        if not docs or len(docs) < 1:
            messagebox.showwarning("无文档", "没有选择要创建关系的文档")
            return False
            
        if not self.current_db:
            messagebox.showwarning("未选择数据库", "未选择数据库")
            return False
        
        # 创建对话框
        dialog = tk.Toplevel(self.parent)
        dialog.title("批量创建关系")
        dialog.grab_set()
        dialog.resizable(False, False)
        
        # 配置输入框架
        main_frame = ttk.Frame(dialog, padding=10)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(main_frame, text=f"已选择文档数量: {len(docs)}").grid(row=0, column=0, columnspan=2, sticky=tk.W, pady=5)
        
        ttk.Label(main_frame, text="关系类型:").grid(row=1, column=0, sticky=tk.W, pady=5)
        rel_type_var = tk.StringVar()
        rel_type_combo = ttk.Combobox(main_frame, textvariable=rel_type_var, values=self.relationship_types)
        rel_type_combo.grid(row=1, column=1, sticky=tk.EW, pady=5)
        
        ttk.Label(main_frame, text="目标集合:").grid(row=2, column=0, sticky=tk.W, pady=5)
        target_coll_var = tk.StringVar()
        collections = self.db_manager.list_collections(self.current_db)
        target_coll_combo = ttk.Combobox(main_frame, textvariable=target_coll_var, values=collections)
        target_coll_combo.grid(row=2, column=1, sticky=tk.EW, pady=5)
        
        target_docs = []
        
        def load_targets(event=None):
            """加载目标文档"""
            nonlocal target_docs
            coll = target_coll_var.get()
            if coll:
                try:
                    target_docs = self.db_manager.get_documents(self.current_db, coll, limit=100)
                    target_doc_combo['values'] = [doc.get('filename', str(doc.get('_id'))) for doc in target_docs]
                except Exception as e:
                    messagebox.showerror("错误", f"加载目标文档失败: {e}")
        
        target_coll_combo.bind("<<ComboboxSelected>>", load_targets)
        
        ttk.Label(main_frame, text="目标文档:").grid(row=3, column=0, sticky=tk.W, pady=5)
        target_doc_frame = ttk.Frame(main_frame)
        target_doc_frame.grid(row=3, column=1, sticky=tk.EW, pady=5)
        
        target_doc_var = tk.StringVar()
        target_doc_combo = ttk.Combobox(target_doc_frame, textvariable=target_doc_var, values=[], width=30)
        target_doc_combo.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # 按钮
        btn_frame = ttk.Frame(dialog)
        btn_frame.pack(fill=tk.X, pady=10)
        
        result = {'success': False}
        
        def on_create():
            """创建关系"""
            if not rel_type_var.get():
                messagebox.showwarning("缺少数据", "请选择关系类型")
                return
                
            if not target_coll_var.get():
                messagebox.showwarning("缺少数据", "请选择目标集合")
                return
                
            if not target_doc_var.get():
                messagebox.showwarning("缺少数据", "请选择目标文档")
                return
                
            try:
                # 获取目标文档
                target_idx = target_doc_combo.current()
                if target_idx < 0 or target_idx >= len(target_docs):
                    messagebox.showwarning("缺少数据", "请选择有效的目标文档")
                    return
                    
                target_doc = target_docs[target_idx]
                
                # 创建关系集合
                rel_collection = "relationships"
                if rel_collection not in self.db_manager.list_collections(self.current_db):
                    self.db_manager.insert_document(self.current_db, rel_collection, {"_placeholder": True})
                
                # 获取目标ID并确保是字符串
                target_id = target_doc.get('_id')
                if isinstance(target_id, ObjectId):
                    target_id = str(target_id)
                
                # 为每个选定文档创建关系
                successful = 0
                for source_doc in docs:
                    # 获取源ID并确保是字符串
                    source_id = source_doc.get('_id')
                    if isinstance(source_id, ObjectId):
                        source_id = str(source_id)
                        
                    rel_doc = {
                        "source_id": source_id,
                        "source_collection": self.current_collection,
                        "target_id": target_id,
                        "target_collection": target_coll_var.get(),
                        "relationship_type": rel_type_var.get(),
                        "created_at": datetime.datetime.now()
                    }
                    
                    # 保存到数据库
                    self.db_manager.insert_document(self.current_db, rel_collection, rel_doc)
                    successful += 1
                
                result['success'] = True
                messagebox.showinfo("成功", f"成功创建 {successful} 个关系！")
                dialog.destroy()
                
                # 触发回调
                if self.on_relationship_change:
                    self.on_relationship_change()
                
            except Exception as e:
                print(f"创建关系失败: {e}")
                messagebox.showerror("错误", f"创建关系失败: {e}")
        
        ttk.Button(btn_frame, text="创建", command=on_create).pack(side=tk.RIGHT, padx=5)
        ttk.Button(btn_frame, text="取消", command=dialog.destroy).pack(side=tk.RIGHT, padx=5)
        
        # 居中对话框
        dialog.update_idletasks()
        width = dialog.winfo_width()
        height = dialog.winfo_height()
        x = (dialog.winfo_screenwidth() // 2) - (width // 2)
        y = (dialog.winfo_screenheight() // 2) - (height // 2)
        dialog.geometry(f'{width}x{height}+{x}+{y}')
        
        # 等待对话框关闭
        dialog.wait_window()
        
        return result.get('success', False)
    
    def _ensure_string_id(self, obj_id):
        """确保ID是字符串类型
        
        Args:
            obj_id: 可能是ObjectId或者字符串的ID
            
        Returns:
            str: 字符串形式的ID
        """
        if isinstance(obj_id, ObjectId):
            return str(obj_id)
        return str(obj_id)
    
    def clear_relationships(self):
        """清空关系列表"""
        if hasattr(self, 'rel_tree'):
            self.rel_tree.delete(*self.rel_tree.get_children()) 