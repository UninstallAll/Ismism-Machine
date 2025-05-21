#!/usr/bin/env python3
"""
MongoDB可视化工具配置模块
包含应用程序的全局配置参数
"""
import os

# MongoDB连接设置
DEFAULT_MONGODB_URI = "mongodb://localhost:27017/"  # MongoDB默认连接URI
AUTO_CONNECT = True  # 是否在启动时自动连接MongoDB
DEFAULT_DATABASE = "art_metadata_db"  # 默认数据库名称

# UI设置
DEFAULT_GRID_COLUMNS = 3  # 默认网格列数
DEFAULT_PAGE_SIZE = 48    # 默认每页显示的文档数量
WINDOW_SIZE = "1200x800"  # 窗口默认大小
CARD_WIDTH = 250          # 卡片默认宽度
CARD_HEIGHT = 200         # 卡片默认高度

# 图像相关设置
IMAGE_PATH = '../public/images'  # 默认图像存储路径（相对于项目根目录）

# 关系类型定义
RELATIONSHIP_TYPES = [
    "Created",       # 艺术家创作作品
    "BelongsTo",     # 作品属于艺术流派
    "Influenced",    # 艺术家/流派影响了其他人
    "Contains",      # 集合包含元素
    "InheritedFrom", # 风格继承
    "CollaboratedWith" # 艺术家之间的合作
]

# 文件相关设置
CONFIG_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "user_config.json")
LOG_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "db_file_inconsistencies.log")

# 默认用户配置
DEFAULT_CONFIG = {
    "last_db": "",
    "last_collection": "",
    "auto_connect": AUTO_CONNECT,
    "mongodb_uri": DEFAULT_MONGODB_URI,
    "grid_columns": DEFAULT_GRID_COLUMNS
} 