#!/usr/bin/env python3
# MongoDB可视化工具配置文件

# MongoDB连接设置
DEFAULT_MONGODB_URI = "mongodb://localhost:27017/"
AUTO_CONNECT = True  # 是否在启动时自动连接MongoDB
DEFAULT_DATABASE = "art_metadata_db"  # 默认数据库，现在可被用户配置覆盖

# UI设置
DEFAULT_GRID_COLUMNS = 3  # 默认网格列数
DEFAULT_PAGE_SIZE = 12    # 默认每页显示的文档数量
WINDOW_SIZE = "1200x800"  # 窗口大小

# 关系类型定义
RELATIONSHIP_TYPES = [
    "Created",           # 源创建了目标
    "BelongsTo",         # 目标属于源
    "Influenced",        # 源影响了目标
    "Contains",          # 源包含目标
    "InheritedFrom",     # 源继承自目标
    "CollaboratedWith"   # 源与目标合作
]

# Image-related settings
IMAGE_PATH = '../public/images'

# UI settings
DEFAULT_GRID_COLUMNS = 3
DEFAULT_PAGE_SIZE = 12
WINDOW_SIZE = "1200x800"

# Relationship type definitions
RELATIONSHIP_TYPES = [
    "Created",       # Artist created artwork
    "BelongsTo",     # Artwork belongs to art movement
    "Influenced",    # Artist/movement influenced others
    "Contains",      # Collection contains elements
    "InheritedFrom", # Style inheritance
    "CollaboratedWith" # Collaboration between artists
] 