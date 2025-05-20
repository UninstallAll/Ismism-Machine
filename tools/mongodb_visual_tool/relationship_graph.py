"""
关系可视化模块 - 用于展示实体间的关联关系图
"""
import math
import random
from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QGraphicsView, QGraphicsScene,
                           QGraphicsItem, QGraphicsEllipseItem, QGraphicsLineItem,
                           QGraphicsTextItem, QGraphicsRectItem, QPushButton, QHBoxLayout,
                           QLabel, QComboBox)
from PyQt6.QtCore import Qt, QRectF, QPointF, QLineF
from PyQt6.QtGui import QPen, QBrush, QColor, QPainter, QFont

class EntityNode(QGraphicsEllipseItem):
    """实体节点"""
    def __init__(self, entity_id, entity_name, entity_type, x=0, y=0, radius=30):
        super().__init__(0, 0, radius * 2, radius * 2)
        self.entity_id = entity_id
        self.entity_name = entity_name
        self.entity_type = entity_type
        self.radius = radius
        
        # 设置位置
        self.setPos(x - radius, y - radius)
        
        # 设置外观
        self.set_appearance()
        
        # 添加文字标签
        self.label = QGraphicsTextItem(self)
        self.label.setPlainText(entity_name)
        font = QFont()
        font.setPointSize(8)
        self.label.setFont(font)
        
        # 居中文字
        text_width = self.label.boundingRect().width()
        text_height = self.label.boundingRect().height()
        self.label.setPos(radius - text_width / 2, radius - text_height / 2)
        
        # 使节点可移动
        self.setFlag(QGraphicsItem.GraphicsItemFlag.ItemIsMovable)
        self.setFlag(QGraphicsItem.GraphicsItemFlag.ItemIsSelectable)
        self.setFlag(QGraphicsItem.GraphicsItemFlag.ItemSendsGeometryChanges)
    
    def set_appearance(self):
        """根据实体类型设置节点外观"""
        # 根据实体类型使用不同颜色
        if self.entity_type == 'artist':
            color = QColor(100, 180, 255)  # 蓝色 - 艺术家
        elif self.entity_type == 'artwork':
            color = QColor(255, 180, 100)  # 橙色 - 作品
        elif self.entity_type == 'movement':
            color = QColor(180, 255, 140)  # 绿色 - 艺术流派
        else:
            color = QColor(200, 200, 200)  # 灰色 - 其他
        
        self.setBrush(QBrush(color))
        self.setPen(QPen(Qt.PenStyle.SolidLine))
    
    def itemChange(self, change, value):
        """处理项目变更，用于在节点移动时更新连接线"""
        if change == QGraphicsItem.GraphicsItemChange.ItemPositionChange and self.scene():
            # 通知场景节点位置已更改
            if hasattr(self.scene(), 'update_edges'):
                self.scene().update_edges(self)
        return super().itemChange(change, value)

class RelationshipEdge(QGraphicsLineItem):
    """关系连接线"""
    def __init__(self, source_node, target_node, relationship_type=""):
        super().__init__()
        self.source_node = source_node
        self.target_node = target_node
        self.relationship_type = relationship_type
        
        # 设置连接线样式
        pen = QPen(Qt.PenStyle.SolidLine)
        pen.setWidth(1)
        pen.setColor(QColor(100, 100, 100))
        self.setPen(pen)
        
        # 更新连接线位置
        self.update_position()
        
        # 添加关系类型标签
        self.label = QGraphicsTextItem(self.relationship_type)
        self.label.setParentItem(self)
        font = QFont()
        font.setPointSize(7)
        self.label.setFont(font)
        self.update_label_position()
    
    def update_position(self):
        """更新连接线的位置"""
        if not self.source_node or not self.target_node:
            return
            
        # 获取节点中心点
        source_center = self.source_node.pos() + QPointF(self.source_node.radius, self.source_node.radius)
        target_center = self.target_node.pos() + QPointF(self.target_node.radius, self.target_node.radius)
        
        # 计算节点边缘的交点
        angle = math.atan2(target_center.y() - source_center.y(), target_center.x() - source_center.x())
        
        source_edge_x = source_center.x() + math.cos(angle) * self.source_node.radius
        source_edge_y = source_center.y() + math.sin(angle) * self.source_node.radius
        
        target_edge_x = target_center.x() - math.cos(angle) * self.target_node.radius
        target_edge_y = target_center.y() - math.sin(angle) * self.target_node.radius
        
        # 设置线的起点和终点
        self.setLine(QLineF(source_edge_x, source_edge_y, target_edge_x, target_edge_y))
        
        # 更新标签位置
        self.update_label_position()
    
    def update_label_position(self):
        """更新关系标签的位置"""
        # 将标签放置在线的中间
        line = self.line()
        mid_x = (line.x1() + line.x2()) / 2
        mid_y = (line.y1() + line.y2()) / 2
        
        # 计算标签偏移量使其不直接位于线上
        dx = line.x2() - line.x1()
        dy = line.y2() - line.y1()
        line_length = math.sqrt(dx**2 + dy**2)
        
        if line_length > 0:
            offset_x = -dy * 10 / line_length
            offset_y = dx * 10 / line_length
        else:
            offset_x = offset_y = 0
        
        # 设置标签位置
        self.label.setPos(mid_x + offset_x - self.label.boundingRect().width() / 2,
                        mid_y + offset_y - self.label.boundingRect().height() / 2)

class RelationshipGraphScene(QGraphicsScene):
    """关系图场景"""
    def __init__(self, parent=None):
        super().__init__(parent)
        self.nodes = {}  # 存储节点: {entity_id: node}
        self.edges = []  # 存储边
    
    def add_node(self, entity_id, entity_name, entity_type, x=None, y=None):
        """添加实体节点"""
        # 检查节点是否已存在
        if entity_id in self.nodes:
            return self.nodes[entity_id]
            
        # 如果未指定位置，则随机生成
        if x is None or y is None:
            width = self.width() if self.width() > 100 else 500
            height = self.height() if self.height() > 100 else 400
            x = random.uniform(50, width - 50)
            y = random.uniform(50, height - 50)
        
        # 创建节点
        node = EntityNode(entity_id, entity_name, entity_type, x, y)
        self.addItem(node)
        self.nodes[entity_id] = node
        return node
    
    def add_edge(self, source_id, target_id, relationship_type):
        """添加关系连接线"""
        # 确保两个节点都存在
        if source_id not in self.nodes or target_id not in self.nodes:
            return None
            
        source_node = self.nodes[source_id]
        target_node = self.nodes[target_id]
        
        # 创建边
        edge = RelationshipEdge(source_node, target_node, relationship_type)
        self.addItem(edge)
        self.edges.append(edge)
        return edge
    
    def clear_graph(self):
        """清除图形"""
        self.clear()
        self.nodes = {}
        self.edges = []
    
    def update_edges(self, node):
        """更新与节点相关的所有边"""
        for edge in self.edges:
            if edge.source_node == node or edge.target_node == node:
                edge.update_position()

class RelationshipGraphView(QGraphicsView):
    """关系图视图"""
    def __init__(self, parent=None):
        super().__init__(parent)
        self.scene = RelationshipGraphScene()
        self.setScene(self.scene)
        
        # 设置视图属性
        self.setRenderHint(QPainter.RenderHint.Antialiasing)
        self.setDragMode(QGraphicsView.DragMode.RubberBandDrag)
        self.setTransformationAnchor(QGraphicsView.ViewportAnchor.AnchorUnderMouse)
        self.setResizeAnchor(QGraphicsView.ViewportAnchor.AnchorUnderMouse)
        
        # 设置场景大小
        self.scene.setSceneRect(0, 0, 1000, 800)
    
    def wheelEvent(self, event):
        """处理鼠标滚轮事件，实现缩放功能"""
        zoom_factor = 1.15
        
        if event.angleDelta().y() > 0:
            # 放大
            self.scale(zoom_factor, zoom_factor)
        else:
            # 缩小
            self.scale(1.0 / zoom_factor, 1.0 / zoom_factor)

class RelationshipGraphWidget(QWidget):
    """关系图组件"""
    def __init__(self, db_client=None, parent=None):
        super().__init__(parent)
        self.db_client = db_client
        self.init_ui()
    
    def init_ui(self):
        """初始化UI"""
        layout = QVBoxLayout(self)
        
        # 工具栏
        toolbar_layout = QHBoxLayout()
        
        # 节点类型选择
        self.entity_type_combo = QComboBox()
        self.entity_type_combo.addItems(["全部", "艺术家", "作品", "艺术流派"])
        toolbar_layout.addWidget(QLabel("筛选:"))
        toolbar_layout.addWidget(self.entity_type_combo)
        
        # 布局控制按钮
        self.auto_layout_button = QPushButton("自动布局")
        self.auto_layout_button.clicked.connect(self.auto_layout)
        toolbar_layout.addWidget(self.auto_layout_button)
        
        # 刷新按钮
        self.refresh_button = QPushButton("刷新")
        self.refresh_button.clicked.connect(self.refresh_graph)
        toolbar_layout.addWidget(self.refresh_button)
        
        # 重置视图
        self.reset_view_button = QPushButton("重置视图")
        self.reset_view_button.clicked.connect(self.reset_view)
        toolbar_layout.addWidget(self.reset_view_button)
        
        toolbar_layout.addStretch(1)
        layout.addLayout(toolbar_layout)
        
        # 关系图视图
        self.graph_view = RelationshipGraphView()
        layout.addWidget(self.graph_view, 1)
    
    def set_db_client(self, db_client):
        """设置数据库客户端"""
        self.db_client = db_client
    
    def load_graph_data(self):
        """从数据库加载图数据"""
        if not self.db_client:
            return
            
        try:
            # 清除现有图形
            self.graph_view.scene.clear_graph()
            
            db = self.db_client.get_database()
            relationships_collection = db.get_collection('relationships')
            
            # 选择当前筛选的实体类型
            entity_type_filter = None
            selected_type = self.entity_type_combo.currentText()
            if selected_type == "艺术家":
                entity_type_filter = "artist"
            elif selected_type == "作品":
                entity_type_filter = "artwork"
            elif selected_type == "艺术流派":
                entity_type_filter = "movement"
            
            # 构建查询条件
            query = {}
            
            # 加载关系数据
            for rel in relationships_collection.find(query):
                from_id = rel.get('from_id')
                from_name = rel.get('from_name', '未知')
                to_id = rel.get('to_id')
                to_name = rel.get('to_name', '未知')
                relation_type = rel.get('relation_type', '关联')
                
                # 确定节点类型(简单判断，可以优化)
                from_type = self.guess_entity_type(from_name)
                to_type = self.guess_entity_type(to_name)
                
                # 根据筛选添加节点
                if entity_type_filter is None or from_type == entity_type_filter or to_type == entity_type_filter:
                    # 添加节点
                    self.graph_view.scene.add_node(from_id, from_name, from_type)
                    self.graph_view.scene.add_node(to_id, to_name, to_type)
                    
                    # 添加边
                    self.graph_view.scene.add_edge(from_id, to_id, relation_type)
            
            # 应用自动布局
            self.auto_layout()
        except Exception as e:
            print(f"加载关系图数据失败: {e}")
    
    def guess_entity_type(self, name):
        """根据名称猜测实体类型"""
        # 这个方法可以通过查询数据库来精确判断，这里为了简化演示使用简单的启发式方法
        name_lower = name.lower()
        if "《" in name or "》" in name:
            return "artwork"
        elif "主义" in name or "流派" in name or "风格" in name:
            return "movement"
        else:
            return "artist"
    
    def auto_layout(self):
        """应用自动布局算法"""
        # 这里使用简单的力导向布局
        if not self.graph_view.scene.nodes:
            return
            
        # 设置一些布局参数
        width = self.graph_view.width()
        height = self.graph_view.height()
        iterations = 100
        k = 100  # 理想弹簧长度
        
        # 初始化所有节点为随机位置
        for node in self.graph_view.scene.nodes.values():
            node.setPos(random.uniform(50, width - 100), random.uniform(50, height - 100))
        
        # 运行力导向布局迭代
        for _ in range(iterations):
            # 对每个节点计算力
            forces = {node_id: [0, 0] for node_id in self.graph_view.scene.nodes}
            
            # 排斥力 (每对节点之间)
            node_items = list(self.graph_view.scene.nodes.items())
            for i in range(len(node_items)):
                id1, node1 = node_items[i]
                pos1 = node1.pos() + QPointF(node1.radius, node1.radius)
                
                for j in range(i + 1, len(node_items)):
                    id2, node2 = node_items[j]
                    pos2 = node2.pos() + QPointF(node2.radius, node2.radius)
                    
                    # 计算距离和方向
                    dx = pos2.x() - pos1.x()
                    dy = pos2.y() - pos1.y()
                    distance = math.sqrt(dx**2 + dy**2)
                    
                    if distance == 0:
                        distance = 0.001
                    
                    # 排斥力与距离的平方成反比
                    force = k**2 / distance
                    fx = force * dx / distance
                    fy = force * dy / distance
                    
                    forces[id1][0] -= fx
                    forces[id1][1] -= fy
                    forces[id2][0] += fx
                    forces[id2][1] += fy
            
            # 吸引力 (相连节点之间)
            for edge in self.graph_view.scene.edges:
                source_id = edge.source_node.entity_id
                target_id = edge.target_node.entity_id
                
                pos1 = edge.source_node.pos() + QPointF(edge.source_node.radius, edge.source_node.radius)
                pos2 = edge.target_node.pos() + QPointF(edge.target_node.radius, edge.target_node.radius)
                
                # 计算距离和方向
                dx = pos2.x() - pos1.x()
                dy = pos2.y() - pos1.y()
                distance = math.sqrt(dx**2 + dy**2)
                
                if distance == 0:
                    distance = 0.001
                
                # 吸引力与距离成正比
                force = distance**2 / k
                fx = force * dx / distance
                fy = force * dy / distance
                
                forces[source_id][0] += fx
                forces[source_id][1] += fy
                forces[target_id][0] -= fx
                forces[target_id][1] -= fy
            
            # 应用力
            max_delta = 5.0  # 限制每次移动的最大距离
            for node_id, force in forces.items():
                node = self.graph_view.scene.nodes[node_id]
                dx = min(max(force[0], -max_delta), max_delta)
                dy = min(max(force[1], -max_delta), max_delta)
                
                # 移动节点
                current_pos = node.pos()
                node.setPos(current_pos.x() + dx, current_pos.y() + dy)
        
        # 更新所有边
        for edge in self.graph_view.scene.edges:
            edge.update_position()
    
    def refresh_graph(self):
        """刷新图形"""
        self.load_graph_data()
    
    def reset_view(self):
        """重置视图"""
        self.graph_view.resetTransform()
        self.graph_view.setSceneRect(self.graph_view.scene.itemsBoundingRect()) 