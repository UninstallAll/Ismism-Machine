# MongoDB Visual Tool

MongoDB可视化工具是一个用于浏览和管理MongoDB数据库的图形界面应用程序，特别适合查看和管理包含图像路径的文档集合。

## 功能特点

- 连接到MongoDB服务器
- 浏览数据库和集合
- 以网格或列表形式查看文档
- 显示图像预览（如果文档包含图像路径）
- 搜索和过滤文档
- 导出文档为JSON格式
- 创建文档之间的关系
- 批量操作（导出、创建关系）

## 系统要求

- Python 3.6 或更高版本
- MongoDB 服务器（本地或远程）
- 支持的操作系统：Windows、macOS、Linux

## 安装

1. 确保已安装Python 3.6+
2. 克隆或下载此仓库
3. 在Windows上，双击运行 `start_mongo_tool.bat`
4. 在其他操作系统上，运行以下命令：

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 启动应用程序
python launcher.py
```

## 使用方法

1. 启动应用程序后，输入MongoDB连接URI（默认为`mongodb://localhost:27017/`）
2. 点击"连接"按钮
3. 在左侧树视图中选择数据库和集合
4. 在右侧面板中查看文档

## 配置

应用程序会自动保存以下配置：

- MongoDB连接URI
- 上次选择的数据库和集合
- 自动连接设置
- 网格列数

## 开发

### 项目结构

```
mongodb_visual_tool/
├── launcher.py          # 启动器
├── main.py              # 主程序入口
├── requirements.txt     # 依赖列表
├── start_mongo_tool.bat # Windows启动脚本
├── user_config.json     # 用户配置文件
└── src/                 # 源代码
    ├── config/          # 配置模块
    ├── core/            # 核心功能模块
    ├── db/              # 数据库模块
    ├── ui/              # 用户界面模块
    └── utils/           # 工具函数模块
```

## 许可

此项目采用MIT许可证。 