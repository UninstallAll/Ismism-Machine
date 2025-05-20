"""
MongoDB可视化管理工具的配置文件
"""

# MongoDB连接配置
DEFAULT_MONGODB_URI = 'mongodb://localhost:27017'

# 默认数据库名称
DEFAULT_DATABASE = 'ismism_machine'

# 图片相关配置
IMAGE_PATH = '../public/images'

# 关系类型定义
RELATIONSHIP_TYPES = [
    "创作",  # 艺术家创作作品
    "属于",  # 作品属于某艺术流派
    "影响",  # 艺术家/流派影响其他艺术家/流派
    "包含",  # 集合包含元素
    "继承",  # 艺术风格的传承
    "合作",  # 艺术家之间的合作关系
] 