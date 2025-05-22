#!/usr/bin/env python3
"""
将MongoDB可视化工具界面从中文翻译为英文的脚本
"""
import os
import re
import shutil

def translate_main_py():
    """翻译main.py中的中文UI文本为英文"""
    
    target_file = 'main.py'
    backup_file = 'main.py.translate.bak'
    
    if not os.path.exists(target_file):
        print(f"错误: 文件不存在 {target_file}")
        return False
    
    # 创建备份
    shutil.copy2(target_file, backup_file)
    print(f"已创建备份: {backup_file}")
    
    # 读取文件内容
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 翻译类注释
    content = content.replace('"""MongoDB可视化工具主应用程序"""', '"""MongoDB Visual Tool Main Application"""')
    
    # 翻译窗口标题
    content = content.replace('self.title("Ismism-Machine MongoDB可视化工具")', 'self.title("Ismism-Machine MongoDB Visual Tool")')
    
    # 翻译UI元素文本
    translations = {
        '连接设置': 'Connection Settings',
        '启动时自动连接': 'Auto-connect on startup',
        '连接': 'Connect',
        '数据库和集合': 'Databases and Collections',
        '就绪': 'Ready',
        '文档详情': 'Document Details',
        '正在自动连接到': 'Auto-connecting to',
        '已成功连接到MongoDB': 'Successfully connected to MongoDB',
        '自动连接失败': 'Auto-connection failed',
        '自动连接错误': 'Auto-connection Error',
        '无法自动连接到MongoDB': 'Could not auto-connect to MongoDB',
        '正在连接到': 'Connecting to',
        '连接错误': 'Connection Error',
        '无法连接到MongoDB': 'Could not connect to MongoDB',
        '数据库': 'Database',
        '集合': 'Collection',
        '总计': 'Total',
        '个文档': 'documents',
        '加载集合数据失败': 'Failed to load collection data',
        '无法加载集合数据': 'Could not load collection data',
        '右键点击项目查看更多操作': 'Right-click an item for more actions',
        '查看详情': 'View Details',
        '导出JSON': 'Export JSON',
        '创建关系': 'Create Relationship',
        '删除': 'Delete',
        '确认删除': 'Confirm Deletion',
        '确定要删除此文档吗？此操作无法撤销。': 'Are you sure you want to delete this document? This action cannot be undone.',
        '导出': 'Export',
        '导出成功': 'Export Successful',
        '文档已成功导出到': 'Document exported successfully to',
        '导出失败': 'Export Failed',
        '无法导出文档': 'Failed to export document',
    }
    
    for chinese, english in translations.items():
        content = content.replace(f'"{chinese}"', f'"{english}"')
        content = content.replace(f"'{chinese}'", f"'{english}'")
    
    # 翻译类方法和变量
    method_translations = {
        'def auto_connect_mongodb': 'def auto_connect_mongodb',
        'def connect_mongodb': 'def connect_mongodb',
        'def populate_db_tree': 'def populate_db_tree',
        'def on_tree_select': 'def on_tree_select',
        'def load_collection_data': 'def load_collection_data',
        'def update_grid_with_docs': 'def update_grid_with_docs',
        'def update_status': 'def update_status',
        'def handle_context_menu': 'def handle_context_menu',
        'def show_document_details': 'def show_document_details',
        'def bson_to_json': 'def bson_to_json',
        'def on_close': 'def on_close',
    }
    
    # 这里不更改方法名，只是占位以保持代码结构
    
    # 写入修改后的内容
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"已翻译 {target_file} 中的UI文本")
    return True

def main():
    """执行所有翻译步骤"""
    
    print("开始翻译MongoDB可视化工具界面...")
    
    success = translate_main_py()
    
    if success:
        print("\n✓ 翻译完成。应用程序界面现在显示为英文。")
        return True
    else:
        print("\n✗ 翻译过程中出现错误。")
        return False

if __name__ == "__main__":
    main() 