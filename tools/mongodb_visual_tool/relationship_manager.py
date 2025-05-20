"""
管理实体间关系的模块
"""
import pymongo
from bson import ObjectId
from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel, 
                           QPushButton, QComboBox, QTableWidget, QTableWidgetItem,
                           QDialog, QDialogButtonBox, QFormLayout, QLineEdit,
                           QMessageBox)
from PyQt6.QtCore import Qt, pyqtSignal
from config import RELATIONSHIP_TYPES

class Relationship:
    """关系对象，代表两个实体之间的关系"""
    def __init__(self, from_id, from_name, to_id, to_name, relation_type):
        self.from_id = from_id
        self.from_name = from_name
        self.to_id = to_id
        self.to_name = to_name
        self.relation_type = relation_type
    
    def to_dict(self):
        """转换为字典形式"""
        return {
            'from_id': self.from_id,
            'from_name': self.from_name,
            'to_id': self.to_id,
            'to_name': self.to_name,
            'relation_type': self.relation_type
        }

class RelationshipDialog(QDialog):
    """创建/编辑关系的对话框"""
    def __init__(self, db_client, parent=None, existing_relation=None):
        super().__init__(parent)
        self.db_client = db_client
        self.existing_relation = existing_relation
        self.init_ui()
    
    def init_ui(self):
        """初始化UI"""
        self.setWindowTitle("创建关系")
        self.setMinimumWidth(400)
        
        layout = QVBoxLayout(self)
        form_layout = QFormLayout()
        
        # 选择源实体
        self.from_entity_combo = QComboBox()
        self.load_entities(self.from_entity_combo)
        form_layout.addRow("从实体:", self.from_entity_combo)
        
        # 选择关系类型
        self.relation_type_combo = QComboBox()
        self.relation_type_combo.addItems(RELATIONSHIP_TYPES)
        form_layout.addRow("关系类型:", self.relation_type_combo)
        
        # 选择目标实体
        self.to_entity_combo = QComboBox()
        self.load_entities(self.to_entity_combo)
        form_layout.addRow("到实体:", self.to_entity_combo)
        
        layout.addLayout(form_layout)
        
        # 按钮
        button_box = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel)
        button_box.accepted.connect(self.accept)
        button_box.rejected.connect(self.reject)
        layout.addWidget(button_box)
        
        # 如果是编辑现有关系，填充表单
        if self.existing_relation:
            # 设置默认值（需要查找索引）
            # 这里需要根据实际情况完善
            pass
    
    def load_entities(self, combo_box):
        """加载实体到下拉框"""
        if not self.db_client:
            return
            
        combo_box.clear()
        
        # 加载所有艺术家
        try:
            db = self.db_client.get_database()
            artists_collection = db.get_collection('artists')
            for artist in artists_collection.find({}, {'_id': 1, 'name': 1}):
                combo_box.addItem(artist.get('name', '未命名艺术家'), str(artist['_id']))
        except Exception as e:
            print(f"加载艺术家失败: {e}")
        
        # 加载所有作品
        try:
            artworks_collection = db.get_collection('artworks')
            for artwork in artworks_collection.find({}, {'_id': 1, 'title': 1}):
                combo_box.addItem(artwork.get('title', '未命名作品'), str(artwork['_id']))
        except Exception as e:
            print(f"加载作品失败: {e}")
        
        # 加载所有艺术流派
        try:
            movements_collection = db.get_collection('movements')
            for movement in movements_collection.find({}, {'_id': 1, 'name': 1}):
                combo_box.addItem(movement.get('name', '未命名流派'), str(movement['_id']))
        except Exception as e:
            print(f"加载艺术流派失败: {e}")
    
    def get_relationship(self):
        """获取用户创建的关系"""
        if self.result() != QDialog.DialogCode.Accepted:
            return None
            
        from_index = self.from_entity_combo.currentIndex()
        to_index = self.to_entity_combo.currentIndex()
        relation_type = self.relation_type_combo.currentText()
        
        if from_index < 0 or to_index < 0:
            return None
            
        from_id = self.from_entity_combo.itemData(from_index)
        from_name = self.from_entity_combo.currentText()
        to_id = self.to_entity_combo.itemData(to_index)
        to_name = self.to_entity_combo.currentText()
        
        return Relationship(from_id, from_name, to_id, to_name, relation_type)

class RelationshipManager(QWidget):
    """关系管理组件"""
    relationship_changed = pyqtSignal()
    
    def __init__(self, db_client, parent=None):
        super().__init__(parent)
        self.db_client = db_client
        self.relationships = []
        self.init_ui()
    
    def init_ui(self):
        """初始化UI"""
        layout = QVBoxLayout(self)
        
        # 工具栏
        toolbar_layout = QHBoxLayout()
        self.add_button = QPushButton("添加关系")
        self.add_button.clicked.connect(self.add_relationship)
        self.remove_button = QPushButton("删除关系")
        self.remove_button.clicked.connect(self.remove_relationship)
        
        toolbar_layout.addWidget(self.add_button)
        toolbar_layout.addWidget(self.remove_button)
        toolbar_layout.addStretch(1)
        layout.addLayout(toolbar_layout)
        
        # 关系表格
        self.table = QTableWidget(0, 3)
        self.table.setHorizontalHeaderLabels(["源实体", "关系", "目标实体"])
        self.table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        layout.addWidget(self.table)
    
    def set_db_client(self, db_client):
        """设置数据库客户端"""
        self.db_client = db_client
    
    def load_relationships(self, entity_id=None):
        """加载关系数据"""
        if not self.db_client:
            return
            
        self.table.setRowCount(0)
        self.relationships = []
        
        try:
            db = self.db_client.get_database()
            relationships_collection = db.get_collection('relationships')
            
            # 构建查询条件
            query = {}
            if entity_id:
                query = {'$or': [{'from_id': entity_id}, {'to_id': entity_id}]}
            
            for rel in relationships_collection.find(query):
                self.add_relationship_to_table(rel)
        except Exception as e:
            QMessageBox.warning(self, "加载错误", f"加载关系数据失败: {str(e)}")
    
    def add_relationship_to_table(self, rel_data):
        """向表格添加关系"""
        row = self.table.rowCount()
        self.table.insertRow(row)
        
        from_name = rel_data.get('from_name', '未知')
        rel_type = rel_data.get('relation_type', '未知')
        to_name = rel_data.get('to_name', '未知')
        
        self.table.setItem(row, 0, QTableWidgetItem(from_name))
        self.table.setItem(row, 1, QTableWidgetItem(rel_type))
        self.table.setItem(row, 2, QTableWidgetItem(to_name))
        
        # 存储关系数据
        self.relationships.append(rel_data)
    
    def add_relationship(self):
        """添加新关系"""
        if not self.db_client:
            QMessageBox.warning(self, "错误", "未连接到数据库")
            return
            
        dialog = RelationshipDialog(self.db_client, self)
        if dialog.exec():
            rel = dialog.get_relationship()
            if rel:
                try:
                    # 保存到数据库
                    db = self.db_client.get_database()
                    relationships_collection = db.get_collection('relationships')
                    rel_dict = rel.to_dict()
                    result = relationships_collection.insert_one(rel_dict)
                    
                    # 更新关系ID
                    rel_dict['_id'] = result.inserted_id
                    
                    # 添加到表格
                    self.add_relationship_to_table(rel_dict)
                    
                    # 发出信号通知更新
                    self.relationship_changed.emit()
                except Exception as e:
                    QMessageBox.warning(self, "错误", f"保存关系失败: {str(e)}")
    
    def remove_relationship(self):
        """删除选中的关系"""
        selected_rows = self.table.selectionModel().selectedRows()
        if not selected_rows:
            return
            
        # 确认删除
        reply = QMessageBox.question(
            self, '确认删除', 
            f"确定要删除选中的 {len(selected_rows)} 个关系吗?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        
        if reply != QMessageBox.StandardButton.Yes:
            return
            
        try:
            db = self.db_client.get_database()
            relationships_collection = db.get_collection('relationships')
            
            # 从后向前删除，以保持索引一致性
            for index in sorted([row.row() for row in selected_rows], reverse=True):
                if 0 <= index < len(self.relationships):
                    # 从数据库删除
                    rel_id = self.relationships[index].get('_id')
                    if rel_id:
                        relationships_collection.delete_one({'_id': rel_id})
                    
                    # 从表格删除
                    self.table.removeRow(index)
                    # 从列表删除
                    self.relationships.pop(index)
            
            # 发出信号通知更新
            self.relationship_changed.emit()
        except Exception as e:
            QMessageBox.warning(self, "错误", f"删除关系失败: {str(e)}") 