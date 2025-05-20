#!/usr/bin/env python3
import sys
import os
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                            QHBoxLayout, QLabel, QPushButton, QTreeView, 
                            QSplitter, QTabWidget, QMessageBox, QFileDialog,
                            QListWidget, QLineEdit, QComboBox, QFormLayout)
from PyQt6.QtCore import Qt, QSize
from PyQt6.QtGui import QPixmap, QStandardItemModel, QStandardItem, QIcon
import pymongo
from dotenv import load_dotenv
from pathlib import Path

# 导入自定义模块
from drag_drop_handler import ImageDropWidget
from relationship_manager import RelationshipManager
from relationship_graph import RelationshipGraphWidget
from config import DEFAULT_MONGODB_URI, DEFAULT_DATABASE, IMAGE_PATH

# 加载环境变量
load_dotenv()

class MongoDBVisualManager(QMainWindow):
    """MongoDB可视化管理工具的主窗口"""
    
    def __init__(self):
        super().__init__()
        self.title = "艺术作品数据库管理工具"
        self.db_client = None
        self.current_db = None
        self.current_collection = None
        self.current_doc_id = None
        
        # 初始化UI
        self.init_ui()
        
        # 尝试连接数据库
        self.connect_to_mongodb()
        
    def init_ui(self):
        """初始化用户界面"""
        self.setWindowTitle(self.title)
        self.setGeometry(100, 100, 1200, 800)
        
        # 创建中央部件和主布局
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        
        # 创建顶部工具栏
        toolbar_layout = QHBoxLayout()
        self.connect_button = QPushButton("连接数据库")
        self.connect_button.clicked.connect(self.connect_to_mongodb)
        self.refresh_button = QPushButton("刷新")
        self.refresh_button.clicked.connect(self.refresh_data)
        
        toolbar_layout.addWidget(self.connect_button)
        toolbar_layout.addWidget(self.refresh_button)
        toolbar_layout.addStretch(1)
        main_layout.addLayout(toolbar_layout)
        
        # 创建分割器
        splitter = QSplitter(Qt.Orientation.Horizontal)
        main_layout.addWidget(splitter, 1)
        
        # 左侧树状视图 - 用于数据库和集合
        self.db_tree = QTreeView()
        self.db_model = QStandardItemModel()
        self.db_model.setHorizontalHeaderLabels(["数据库/集合"])
        self.db_tree.setModel(self.db_model)
        self.db_tree.clicked.connect(self.on_tree_item_clicked)
        splitter.addWidget(self.db_tree)
        
        # 右侧标签页 - 用于不同视图
        self.tab_widget = QTabWidget()
        
        # 数据视图标签页
        self.data_view_widget = QWidget()
        data_layout = QVBoxLayout(self.data_view_widget)
        
        # 数据列表和详情区域的分割
        data_splitter = QSplitter(Qt.Orientation.Vertical)
        data_layout.addWidget(data_splitter)
        
        # 数据项列表
        self.data_list = QListWidget()
        self.data_list.itemClicked.connect(self.on_data_item_clicked)
        data_splitter.addWidget(self.data_list)
        
        # 数据项详情
        self.detail_widget = QWidget()
        detail_layout = QVBoxLayout(self.detail_widget)
        
        # 图片显示区域 - 现在使用支持拖放的组件
        self.image_widget = ImageDropWidget(target_path=IMAGE_PATH)
        self.image_widget.set_on_image_changed(self.on_image_changed)
        detail_layout.addWidget(self.image_widget)
        
        # 元数据编辑区域
        metadata_widget = QWidget()
        metadata_layout = QVBoxLayout(metadata_widget)
        
        metadata_header = QLabel("元数据")
        metadata_header.setStyleSheet("font-weight: bold; font-size: 14px;")
        metadata_layout.addWidget(metadata_header)
        
        self.metadata_form = QFormLayout()
        metadata_layout.addLayout(self.metadata_form)
        
        detail_layout.addWidget(metadata_widget)
        
        # 保存按钮
        self.save_button = QPushButton("保存更改")
        self.save_button.clicked.connect(self.save_changes)
        detail_layout.addWidget(self.save_button)
        
        data_splitter.addWidget(self.detail_widget)
        
        # 添加数据视图标签页
        self.tab_widget.addTab(self.data_view_widget, "数据视图")
        
        # 关系管理标签页
        self.relationship_widget = QWidget()
        relationship_layout = QVBoxLayout(self.relationship_widget)
        
        # 创建关系管理器
        self.relationship_manager = RelationshipManager(self.db_client)
        relationship_layout.addWidget(self.relationship_manager)
        
        # 添加关系管理标签页
        self.tab_widget.addTab(self.relationship_widget, "关系管理")
        
        # 关系视图标签页
        self.graph_widget = RelationshipGraphWidget(self.db_client)
        self.tab_widget.addTab(self.graph_widget, "关系视图")
        
        splitter.addWidget(self.tab_widget)
        
        # 设置默认分割比例
        splitter.setSizes([300, 900])
        
        # 状态栏
        self.statusBar().showMessage('准备就绪')
    
    def connect_to_mongodb(self):
        """连接到MongoDB数据库"""
        try:
            # 从环境变量或配置获取连接字符串
            mongo_uri = os.getenv('MONGODB_URI', DEFAULT_MONGODB_URI)
            self.db_client = pymongo.MongoClient(mongo_uri)
            # 测试连接
            self.db_client.admin.command('ping')
            self.statusBar().showMessage('已连接到MongoDB')
            
            # 设置关系管理器和图形视图的数据库客户端
            self.relationship_manager.set_db_client(self.db_client)
            self.graph_widget.set_db_client(self.db_client)
            
            # 加载数据库和集合到树视图
            self.populate_db_tree()
        except Exception as e:
            QMessageBox.critical(self, "连接错误", f"无法连接到MongoDB: {str(e)}")
            self.statusBar().showMessage('连接失败')
    
    def populate_db_tree(self):
        """填充数据库树状视图"""
        if not self.db_client:
            return
            
        self.db_model.clear()
        self.db_model.setHorizontalHeaderLabels(["数据库/集合"])
        
        # 获取所有数据库
        for db_name in self.db_client.list_database_names():
            # 跳过系统数据库
            if db_name in ['admin', 'local', 'config']:
                continue
                
            db_item = QStandardItem(db_name)
            self.db_model.appendRow(db_item)
            
            # 获取该数据库下的所有集合
            db = self.db_client[db_name]
            for collection_name in db.list_collection_names():
                collection_item = QStandardItem(collection_name)
                db_item.appendRow(collection_item)
        
        # 展开树
        self.db_tree.expandAll()
    
    def on_tree_item_clicked(self, index):
        """树状视图项被点击的事件处理"""
        item = self.db_model.itemFromIndex(index)
        if not item.parent():
            # 数据库被点击
            self.current_db = item.text()
            self.current_collection = None
            self.statusBar().showMessage(f'已选择数据库: {self.current_db}')
        else:
            # 集合被点击
            self.current_collection = item.text()
            self.current_db = item.parent().text()
            self.statusBar().showMessage(f'已选择集合: {self.current_db}.{self.current_collection}')
            # 加载集合数据
            self.load_collection_data()
    
    def load_collection_data(self):
        """加载当前选中集合的数据"""
        if not self.db_client or not self.current_db or not self.current_collection:
            return
            
        try:
            collection = self.db_client[self.current_db][self.current_collection]
            self.data_list.clear()
            
            # 获取集合中的所有文档
            for doc in collection.find():
                # 显示文档的ID或名称
                item_text = str(doc.get('_id'))
                if 'name' in doc:
                    item_text = doc['name']
                elif 'title' in doc:
                    item_text = doc['title']
                
                self.data_list.addItem(item_text)
                # 存储文档ID作为项的数据
                self.data_list.item(self.data_list.count() - 1).setData(Qt.ItemDataRole.UserRole, str(doc['_id']))
        except Exception as e:
            QMessageBox.warning(self, "加载错误", f"加载数据失败: {str(e)}")
    
    def on_data_item_clicked(self, item):
        """数据列表项被点击的事件处理"""
        if not self.db_client or not self.current_db or not self.current_collection:
            return
            
        try:
            # 获取文档ID
            doc_id = item.data(Qt.ItemDataRole.UserRole)
            self.current_doc_id = doc_id
            collection = self.db_client[self.current_db][self.current_collection]
            
            # 查找文档
            from bson.objectid import ObjectId
            try:
                doc = collection.find_one({'_id': ObjectId(doc_id)})
            except:
                doc = collection.find_one({'_id': doc_id})
                
            if not doc:
                return
                
            # 清除之前的元数据表单
            self.clear_form_layout(self.metadata_form)
            
            # 显示图片（如果有）
            if 'imageUrl' in doc:
                image_path = doc['imageUrl']
                if image_path.startswith('/'):
                    # 尝试从项目public目录加载
                    image_path = os.path.join(os.getcwd(), 'public', image_path.lstrip('/'))
                
                if os.path.exists(image_path):
                    self.image_widget.set_image(image_path)
                else:
                    self.image_widget.image_label.setText("图片不存在: " + doc['imageUrl'])
            else:
                self.image_widget.image_label.setText("该数据项没有关联图片")
            
            # 显示元数据
            for key, value in doc.items():
                if key == '_id' or key == 'imageUrl':
                    continue
                    
                if isinstance(value, dict) or isinstance(value, list):
                    # 对于复杂类型，暂时只显示字符串表示
                    value = str(value)
                
                # 创建编辑字段
                edit = QLineEdit(str(value))
                self.metadata_form.addRow(key, edit)
                
            # 加载与当前文档相关的关系
            if self.tab_widget.currentIndex() == 1:  # 关系管理标签页
                self.relationship_manager.load_relationships(doc_id)
        except Exception as e:
            QMessageBox.warning(self, "加载错误", f"加载数据项详情失败: {str(e)}")
    
    def clear_form_layout(self, layout):
        """清除表单布局中的所有控件"""
        if layout is None:
            return
            
        while layout.count():
            item = layout.takeAt(0)
            widget = item.widget()
            if widget is not None:
                widget.deleteLater()
    
    def save_changes(self):
        """保存对当前数据项的更改"""
        if not self.db_client or not self.current_db or not self.current_collection or not self.current_doc_id:
            QMessageBox.warning(self, "错误", "没有选中的数据项")
            return
            
        try:
            # 构建更新文档
            update_doc = {}
            
            # 收集表单中的数据
            for i in range(self.metadata_form.rowCount()):
                label_item = self.metadata_form.itemAt(i, QFormLayout.ItemRole.LabelRole)
                field_item = self.metadata_form.itemAt(i, QFormLayout.ItemRole.FieldRole)
                
                if label_item and field_item:
                    label = label_item.widget().text().rstrip(':')
                    field_widget = field_item.widget()
                    
                    if isinstance(field_widget, QLineEdit):
                        value = field_widget.text()
                        update_doc[label] = value
            
            # 获取图片路径
            image_path = self.image_widget.get_image_path()
            if image_path:
                # 转换为相对路径存储
                update_doc['imageUrl'] = self.convert_to_db_path(image_path)
            
            # 更新数据库
            collection = self.db_client[self.current_db][self.current_collection]
            from bson.objectid import ObjectId
            try:
                doc_id = ObjectId(self.current_doc_id)
            except:
                doc_id = self.current_doc_id
                
            result = collection.update_one({'_id': doc_id}, {'$set': update_doc})
            
            if result.modified_count > 0:
                QMessageBox.information(self, "成功", "数据已成功更新")
            else:
                QMessageBox.warning(self, "提示", "没有数据被修改")
        except Exception as e:
            QMessageBox.critical(self, "错误", f"保存数据失败: {str(e)}")
    
    def convert_to_db_path(self, image_path):
        """将本地图片路径转换为数据库存储的相对路径"""
        # 如果已经是相对路径格式，直接返回
        if image_path.startswith('/images/'):
            return image_path
            
        # 获取文件名
        filename = os.path.basename(image_path)
        
        # 检查是否在项目public目录中
        public_dir = os.path.join(os.getcwd(), 'public')
        if image_path.startswith(public_dir):
            # 转换为相对路径
            rel_path = os.path.relpath(image_path, public_dir)
            return '/' + rel_path.replace('\\', '/')
        
        # 否则使用默认格式
        return f'/images/{filename}'
    
    def on_image_changed(self, image_path):
        """图片更改的回调"""
        # 可以在这里添加自动保存或其他处理
        pass
    
    def refresh_data(self):
        """刷新数据显示"""
        self.populate_db_tree()
        if self.current_db and self.current_collection:
            self.load_collection_data()
            
        # 刷新关系图
        if self.tab_widget.currentIndex() == 2:  # 关系视图标签页
            self.graph_widget.refresh_graph()

def main():
    app = QApplication(sys.argv)
    window = MongoDBVisualManager()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main() 