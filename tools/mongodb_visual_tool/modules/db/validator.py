#!/usr/bin/env python3
"""
数据验证器 - 检查数据库记录与文件系统的一致性
"""
import os
import logging
from datetime import datetime
from ..config.settings import LOG_FILE

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)

class DataValidator:
    """数据与文件一致性验证器"""
    
    @staticmethod
    def validate_documents_with_files(docs, image_root_path, relative_path=False):
        """验证文档记录中的文件是否存在
        
        Args:
            docs (list): 要验证的文档列表
            image_root_path (str): 图像根目录路径
            relative_path (bool): 文档中的路径是否为相对路径
            
        Returns:
            list: 添加了文件状态标记的文档列表
            list: 不一致性问题的列表
        """
        validated_docs = []
        inconsistencies = []
        
        for doc in docs:
            # 创建文档的副本以避免修改原始文档
            validated_doc = dict(doc)
            
            # 确定文件路径
            file_path = None
            
            if 'filePath' in doc:
                file_path = doc['filePath']
            elif 'imageUrl' in doc:
                file_path = doc['imageUrl']
            elif 'path' in doc:
                file_path = doc['path']
            
            if not file_path:
                # 如果没有文件路径，标记为不一致
                validated_doc['_file_missing'] = True
                validated_doc['_error'] = "No file path found"
                validated_docs.append(validated_doc)
                
                inconsistencies.append({
                    "doc_id": str(doc.get('_id', 'unknown')),
                    "problem": "No file path found in document",
                    "document": {k: str(v) for k, v in doc.items() if k != '_id'}
                })
                continue
            
            # 处理相对路径 - 先尝试直接使用相对路径
            full_path = None
            paths_to_try = []
            
            # 如果设置了相对路径，则构建可能的完整路径
            if relative_path:
                # 1. 尝试直接使用文件路径（可能是绝对路径）
                paths_to_try.append(file_path)
                
                # 2. 尝试将其视为相对于图像根目录的路径
                if not os.path.isabs(file_path):
                    paths_to_try.append(os.path.join(image_root_path, file_path))
                
                # 3. 尝试修正常见的路径问题（例如，使用不同的分隔符）
                norm_path = os.path.normpath(file_path.replace('/', os.path.sep).replace('\\', os.path.sep))
                if norm_path != file_path:
                    paths_to_try.append(norm_path)
                    paths_to_try.append(os.path.join(image_root_path, norm_path))
            else:
                # 如果不是相对路径，只尝试原始路径
                paths_to_try.append(file_path)
            
            # 尝试所有可能的路径
            found = False
            for path in paths_to_try:
                if os.path.exists(path):
                    full_path = path
                    found = True
                    # 更新文档中的文件路径，使其在ImageCard中能正确加载
                    validated_doc['filePath'] = full_path
                    break
            
            if not found:
                validated_doc['_file_missing'] = True
                validated_doc['_error'] = f"File not found. Tried paths: {', '.join(paths_to_try)}"
                
                inconsistencies.append({
                    "doc_id": str(doc.get('_id', 'unknown')),
                    "problem": f"File not found. Tried paths: {', '.join(paths_to_try)}",
                    "document": {k: str(v) for k, v in doc.items() if k != '_id'}
                })
            else:
                # 文件存在，检查文件大小
                try:
                    file_size = os.path.getsize(full_path)
                    if 'size' in doc and isinstance(doc['size'], (int, float)) and abs(doc['size'] - file_size) > 100:
                        # 文件大小不匹配（允许100字节的误差）
                        validated_doc['_size_mismatch'] = True
                        validated_doc['_error'] = f"Size mismatch: DB={doc['size']}, File={file_size}"
                        
                        inconsistencies.append({
                            "doc_id": str(doc.get('_id', 'unknown')),
                            "problem": f"Size mismatch: DB={doc['size']}, File={file_size}",
                            "document": {k: str(v) for k, v in doc.items() if k != '_id'}
                        })
                except Exception as e:
                    validated_doc['_file_error'] = True
                    validated_doc['_error'] = f"Error checking file: {str(e)}"
                    
                    inconsistencies.append({
                        "doc_id": str(doc.get('_id', 'unknown')),
                        "problem": f"Error checking file: {str(e)}",
                        "document": {k: str(v) for k, v in doc.items() if k != '_id'}
                    })
            
            validated_docs.append(validated_doc)
        
        return validated_docs, inconsistencies
    
    @staticmethod
    def log_inconsistencies(inconsistencies):
        """记录不一致性问题到日志
        
        Args:
            inconsistencies (list): 不一致性问题列表
        """
        if not inconsistencies:
            return
            
        logging.info(f"Found {len(inconsistencies)} data inconsistencies:")
        
        for i, issue in enumerate(inconsistencies, 1):
            logging.warning(f"Issue #{i}: {issue['problem']} (Document ID: {issue['doc_id']})")
            
        logging.info(f"Log file: {LOG_FILE}")
        
        # 添加详细记录
        with open(LOG_FILE, 'a') as f:
            f.write(f"\n\n=== Detailed Report ({datetime.now().strftime('%Y-%m-%d %H:%M:%S')}) ===\n")
            
            for i, issue in enumerate(inconsistencies, 1):
                f.write(f"\nIssue #{i}: {issue['problem']}\n")
                f.write(f"Document ID: {issue['doc_id']}\n")
                f.write(f"Document Data: {issue['document']}\n")
                f.write("-" * 50 + "\n") 