# MongoDB Art Database Visualization Tool (Auto-Connect版本)

这个工具是使用Python和Tkinter开发的，用于直观地管理和可视化MongoDB中的艺术数据。此版本增加了自动连接功能，启动时会自动连接到配置的MongoDB数据库。

## 主要特性

- **自动连接MongoDB**: 启动时自动连接到配置的数据库
- **数据库可视化**: 以树形结构查看数据库和集合
- **图片预览**: 直接查看艺术品图片，而不仅仅是JSON数据
- **元数据编辑**: 在界面中直接编辑艺术品和艺术家的元数据
- **关系管理**: 直观地创建和管理艺术家、作品和艺术运动之间的关系
- **分页浏览**: 高效浏览大型集合中的数据
- **导出功能**: 将文档导出为JSON文件

## 系统要求

- Python 3.8+
- MongoDB数据库（本地或远程）
- 所需库: pymongo, pillow, python-dotenv

## 快速开始

### Windows用户

1. 双击`auto_connect_start.bat`脚本运行。它将自动安装所需依赖。
2. 应用将自动连接到配置的MongoDB数据库。

### 手动安装

1. 安装依赖：
   ```
   pip install pymongo pillow python-dotenv
   ```

2. 运行应用：
   ```
   python auto_connect_app.py
   ```

## 配置

应用程序使用`auto_config.py`文件进行配置：

- `DEFAULT_MONGODB_URI`: MongoDB连接URI（默认为`mongodb://localhost:27017`）
- `AUTO_CONNECT`: 是否在启动时自动连接（`True`或`False`）
- `DEFAULT_DATABASE`: 默认数据库名称，自动连接后将选择此数据库
- `DEFAULT_GRID_COLUMNS`: 默认网格列数
- `DEFAULT_PAGE_SIZE`: 每页显示的项目数
- `WINDOW_SIZE`: 应用窗口尺寸

## 使用指南

1. 启动后，应用将自动连接到配置的MongoDB数据库
2. 左侧面板显示可用的数据库和集合
3. 点击一个集合查看其包含的项目
4. 选择一个项目查看其图片和元数据
5. 使用右键菜单访问更多功能（查看详情、创建关系、导出）
6. 使用底部的分页控件浏览更多内容

## 关于此工具

此工具是Ismism-Machine项目的一个实用工具，用于更直观地管理和编辑艺术数据库中的内容。它解决了MongoDB Compass无法直接预览图片或管理复杂关系的问题。 