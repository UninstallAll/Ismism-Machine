import json
import os

class CollectionViews:
    """集合视图管理器 - 每个集合独立维护自己的视图状态"""
    
    def __init__(self):
        # 设置文件路径
        self.settings_path = os.path.join(os.path.expanduser("~"), ".mongodb_collection_views.json")
        # 加载已保存的设置
        self.views = self._load_views()
        
    def _load_views(self):
        """加载已保存的视图设置"""
        try:
            if os.path.exists(self.settings_path):
                with open(self.settings_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # 确保数据结构完整
                    if not isinstance(data, dict):
                        data = {}
                    if 'defaults' not in data:
                        data['defaults'] = {}
                    if 'last_used' not in data:
                        data['last_used'] = {}
                    return data
            return {
                'defaults': {},  # 存储默认视图设置
                'last_used': {}  # 存储上次使用的视图设置
            }
        except Exception as e:
            print(f"加载视图设置失败: {e}")
            return {
                'defaults': {},
                'last_used': {}
            }
            
    def _save_views(self):
        """保存视图设置到文件"""
        try:
            with open(self.settings_path, 'w', encoding='utf-8') as f:
                json.dump(self.views, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"保存视图设置失败: {e}")
            
    def get_view(self, db_name, collection_name):
        """获取指定集合的视图类型
        
        Args:
            db_name (str): 数据库名称
            collection_name (str): 集合名称
            
        Returns:
            str: 'grid' 或 'list'
        """
        key = f"{db_name}:{collection_name}"
        # 优先使用上次使用的视图设置
        if key in self.views['last_used']:
            return self.views['last_used'][key]
        # 其次使用默认视图设置
        if key in self.views['defaults']:
            return self.views['defaults'][key]
        # 最后使用全局默认值
        return 'grid'
        
    def set_view(self, db_name, collection_name, view_type):
        """设置指定集合的视图类型
        
        Args:
            db_name (str): 数据库名称
            collection_name (str): 集合名称
            view_type (str): 'grid' 或 'list'
        """
        if view_type not in ('grid', 'list'):
            return
            
        key = f"{db_name}:{collection_name}"
        # 更新上次使用的视图设置
        self.views['last_used'][key] = view_type
        self._save_views()
        
    def set_default_view(self, db_name, collection_name, view_type):
        """设置指定集合的默认视图类型
        
        Args:
            db_name (str): 数据库名称
            collection_name (str): 集合名称
            view_type (str): 'grid' 或 'list'
        """
        if view_type not in ('grid', 'list'):
            return
            
        key = f"{db_name}:{collection_name}"
        # 更新默认视图设置
        self.views['defaults'][key] = view_type
        # 同时更新上次使用的视图设置
        self.views['last_used'][key] = view_type
        self._save_views()
        
    def clear_last_used(self):
        """清除所有上次使用的视图设置"""
        self.views['last_used'] = {}
        self._save_views() 