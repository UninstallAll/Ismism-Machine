#!/usr/bin/env python3
"""
翻译MongoDB可视化工具模块文件中的中文内容
"""
import os
import re
import shutil

def translate_module_files():
    """翻译模块目录中的文件"""
    
    # 翻译模块文件
    module_translations = [
        ('modules/db/mongo_manager.py', 'mongo_manager.py.translate.bak'),
        ('modules/ui/image_card.py', 'image_card.py.translate.bak'),
        ('modules/config/settings.py', 'settings.py.translate.bak'),
    ]
    
    for module_file, backup_name in module_translations:
        if not os.path.exists(module_file):
            print(f"文件不存在: {module_file}")
            continue
            
        # 创建备份
        backup_file = os.path.join(os.path.dirname(module_file), backup_name)
        shutil.copy2(module_file, backup_file)
        print(f"已创建备份: {backup_file}")
        
        # 读取文件内容
        with open(module_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 翻译文件头部注释
        if 'mongo_manager.py' in module_file:
            content = content.replace('"""MongoDB连接管理器 - 处理数据库连接和操作"""', 
                                     '"""MongoDB Connection Manager - Handle database connections and operations"""')
            content = content.replace('"""MongoDB连接和操作管理类"""', 
                                     '"""MongoDB connection and operation management class"""')
            
        elif 'image_card.py' in module_file:
            content = content.replace('"""图像卡片组件 - 用于显示文档中的图像和元数据"""', 
                                     '"""Image Card Component - For displaying images and metadata from documents"""')
            content = content.replace('"""显示图像和元数据的卡片组件"""', 
                                     '"""Card component for displaying images and metadata"""')
            
        # 写入修改后的内容
        with open(module_file, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"已翻译 {module_file} 中的头部注释")

def translate_app_py():
    """翻译app.py启动文件"""
    
    app_file = 'app.py'
    backup_file = 'app.py.translate.bak'
    
    if not os.path.exists(app_file):
        print(f"文件不存在: {app_file}")
        return False
    
    # 创建备份
    shutil.copy2(app_file, backup_file)
    print(f"已创建备份: {backup_file}")
    
    # 读取文件内容
    with open(app_file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # 翻译字符串内容
    content = content.replace('MongoDB可视化工具', 'MongoDB Visual Tool')
    
    # 写入修改后的内容
    with open(app_file, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"已翻译 {app_file} 中的文本")
    return True

def main():
    """执行所有翻译步骤"""
    
    print("开始翻译模块文件...")
    
    # 翻译模块文件
    translate_module_files()
    
    # 翻译app.py
    translate_app_py()
    
    print("\n✓ 翻译完成。")
    return True

if __name__ == "__main__":
    main() 