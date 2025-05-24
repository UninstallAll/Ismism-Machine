import json
import os

class ViewSettings:
    """管理每个集合的视图设置"""
    
    def __init__(self):
        self.settings_file = os.path.join(os.path.expanduser("~"), ".mongodb_viewer_settings.json")
        self.settings = self._load_settings()
    
    def _load_settings(self):
        """加载设置"""
        if os.path.exists(self.settings_file):
            try:
                with open(self.settings_file, 'r') as f:
                    return json.load(f)
            except:
                return {}
        return {}
    
    def save_settings(self):
        """保存设置"""
        try:
            with open(self.settings_file, 'w') as f:
                json.dump(self.settings, f, indent=2)
        except Exception as e:
            print(f"保存视图设置失败: {e}")
    
    def get_collection_view(self, db_name, collection_name):
        """获取指定集合的视图模式
        
        Args:
            db_name (str): 数据库名
            collection_name (str): 集合名
            
        Returns:
            str: 视图模式 ("grid" 或 "list")
        """
        key = f"{db_name}.{collection_name}"
        return self.settings.get(key, "grid")  # 默认使用网格视图
    
    def set_collection_view(self, db_name, collection_name, view_mode):
        """设置指定集合的视图模式
        
        Args:
            db_name (str): 数据库名
            collection_name (str): 集合名
            view_mode (str): 视图模式 ("grid" 或 "list")
        """
        key = f"{db_name}.{collection_name}"
        self.settings[key] = view_mode
        self.save_settings() 