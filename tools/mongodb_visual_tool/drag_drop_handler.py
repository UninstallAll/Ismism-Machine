"""
处理拖放图片的模块
"""
import os
import shutil
from PyQt6.QtWidgets import QLabel, QWidget, QVBoxLayout, QMessageBox
from PyQt6.QtCore import Qt, QMimeData
from PyQt6.QtGui import QPixmap, QDragEnterEvent, QDropEvent

class DragDropImageLabel(QLabel):
    """
    支持拖放图片的标签组件
    """
    def __init__(self, parent=None, target_path=None):
        super().__init__(parent)
        self.target_path = target_path
        self.setAcceptDrops(True)
        self.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.setText("拖放图片到这里")
        self.setStyleSheet("""
            border: 2px dashed #aaa;
            border-radius: 5px;
            padding: 10px;
            background-color: #f8f8f8;
        """)
        self.setMinimumHeight(200)
        self.image_path = None
        self.on_image_changed = None  # 回调函数
        
    def dragEnterEvent(self, event: QDragEnterEvent):
        """处理拖拽进入事件"""
        # 仅接受包含图片的拖拽
        mime_data = event.mimeData()
        if mime_data.hasUrls() and self._is_image_url(mime_data.urls()[0].toLocalFile()):
            event.acceptProposedAction()
        
    def dropEvent(self, event: QDropEvent):
        """处理拖拽放下事件"""
        file_path = event.mimeData().urls()[0].toLocalFile()
        
        if self._is_image_url(file_path):
            # 处理图片
            self.set_image(file_path)
            event.acceptProposedAction()
            
            # 如果设置了目标路径，复制图片
            if self.target_path:
                self._copy_image_to_target(file_path)
    
    def _is_image_url(self, url):
        """检查URL是否指向图片文件"""
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
        return any(url.lower().endswith(ext) for ext in image_extensions)
    
    def set_image(self, image_path):
        """设置图片"""
        self.image_path = image_path
        pixmap = QPixmap(image_path)
        pixmap = pixmap.scaled(400, 300, Qt.AspectRatioMode.KeepAspectRatio)
        self.setPixmap(pixmap)
        
        # 调用回调函数(如果有)
        if self.on_image_changed:
            self.on_image_changed(image_path)
    
    def _copy_image_to_target(self, source_path):
        """复制图片到目标路径"""
        if not os.path.exists(self.target_path):
            try:
                os.makedirs(self.target_path, exist_ok=True)
            except Exception as e:
                QMessageBox.warning(self, "错误", f"无法创建目标目录: {str(e)}")
                return None
        
        # 生成目标文件名
        filename = os.path.basename(source_path)
        target_file = os.path.join(self.target_path, filename)
        
        # 如果文件已经存在，添加数字后缀
        base, ext = os.path.splitext(filename)
        counter = 1
        while os.path.exists(target_file):
            target_file = os.path.join(self.target_path, f"{base}_{counter}{ext}")
            counter += 1
        
        try:
            # 复制文件
            shutil.copy2(source_path, target_file)
            QMessageBox.information(self, "成功", f"图片已保存到: {target_file}")
            return target_file
        except Exception as e:
            QMessageBox.warning(self, "错误", f"无法复制图片: {str(e)}")
            return None

class ImageDropWidget(QWidget):
    """
    包含拖放图片功能的组件
    """
    def __init__(self, parent=None, target_path=None):
        super().__init__(parent)
        self.layout = QVBoxLayout(self)
        
        self.image_label = DragDropImageLabel(self, target_path)
        self.layout.addWidget(self.image_label)
        
    def set_image(self, image_path):
        """设置图片"""
        self.image_label.set_image(image_path)
        
    def get_image_path(self):
        """获取当前图片路径"""
        return self.image_label.image_path
    
    def set_on_image_changed(self, callback):
        """设置图片变更回调函数"""
        self.image_label.on_image_changed = callback 