#!/usr/bin/env python3
"""
修复MongoDB数据库对象布尔测试问题的脚本
"""
import os
import re
import shutil

def fix_mongo_manager():
    """修复mongo_manager.py文件中的布尔测试问题"""
    
    target_file = os.path.join('modules', 'db', 'mongo_manager.py')
    backup_file = os.path.join('modules', 'db', 'mongo_manager.py.bak')
    
    if not os.path.exists(target_file):
        print(f"错误: 文件不存在 {target_file}")
        return False
    
    # 创建备份
    shutil.copy2(target_file, backup_file)
    print(f"已创建备份: {backup_file}")
    
    # 读取文件内容
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 替换所有直接使用数据库对象作为布尔测试的实例
    # 1. if self.client: -> if self.client is not None:
    content = re.sub(r'if\s+self\.client\s*:', 'if self.client is not None:', content)
    
    # 2. if not self.client: -> if self.client is None:
    content = re.sub(r'if\s+not\s+self\.client\s*:', 'if self.client is None:', content)
    
    # 3. if self.db: -> if self.db is not None:
    content = re.sub(r'if\s+self\.db\s*:', 'if self.db is not None:', content)
    
    # 4. if not self.db: -> if self.db is None:
    content = re.sub(r'if\s+not\s+self\.db\s*:', 'if self.db is None:', content)
    
    # 5. if self.collection: -> if self.collection is not None:
    content = re.sub(r'if\s+self\.collection\s*:', 'if self.collection is not None:', content)
    
    # 6. if not self.collection: -> if self.collection is None:
    content = re.sub(r'if\s+not\s+self\.collection\s*:', 'if self.collection is None:', content)
    
    # 写入修改后的内容
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"已修复 {target_file} 中的MongoDB布尔测试问题")
    return True

def fix_main_py():
    """修复main.py文件中的MongoDB布尔测试问题"""
    
    target_file = 'main.py'
    backup_file = 'main.py.bak'
    
    if not os.path.exists(target_file):
        print(f"错误: 文件不存在 {target_file}")
        return False
    
    # 创建备份
    shutil.copy2(target_file, backup_file)
    print(f"已创建备份: {backup_file}")
    
    # 读取文件内容
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 替换所有直接使用数据库对象作为布尔测试的实例
    # 1. if self.db_manager: -> if self.db_manager is not None:
    content = re.sub(r'if\s+self\.db_manager\s*:', 'if self.db_manager is not None:', content)
    
    # 2. if not self.db_manager: -> if self.db_manager is None:
    content = re.sub(r'if\s+not\s+self\.db_manager\s*:', 'if self.db_manager is None:', content)
    
    # 写入修改后的内容
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"已修复 {target_file} 中的MongoDB布尔测试问题")
    return True

def main():
    """执行所有修复步骤"""
    
    print("开始修复MongoDB布尔测试问题...")
    
    success1 = fix_mongo_manager()
    success2 = fix_main_py()
    
    if success1 and success2:
        print("\n✓ 所有修复完成。请尝试重新运行应用程序。")
        return True
    else:
        print("\n✗ 修复过程中出现错误。")
        return False

if __name__ == "__main__":
    main() 