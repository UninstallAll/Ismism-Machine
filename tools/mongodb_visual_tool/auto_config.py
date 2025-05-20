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

# Image-related settings
IMAGE_PATH = '../public/images'

# Relationship type definitions
RELATIONSHIP_TYPES = [
    "Created",       # Artist created artwork
    "BelongsTo",     # Artwork belongs to art movement
    "Influenced",    # Artist/movement influenced others
    "Contains",      # Collection contains elements
    "InheritedFrom", # Style inheritance
    "CollaboratedWith" # Collaboration between artists
] 