#!/usr/bin/env python3
"""
Cache Manager - 管理MongoDB可视化工具的缓存
"""
import os
import json
import shutil
import time
import threading
from datetime import datetime, timedelta


class CacheManager:
    """缓存管理器 - 管理应用程序的缓存文件"""
    
    def __init__(self, cache_dir=None):
        """初始化缓存管理器
        
        Args:
            cache_dir (str, optional): 缓存目录路径
        """
        # 确定缓存目录
        if cache_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            cache_dir = os.path.join(base_dir, "cache")
        
        self.cache_dir = cache_dir
        self.stats = {
            "total_size": 0,
            "file_count": 0,
            "last_cleanup": None,
            "cache_hits": 0,
            "cache_misses": 0
        }
        
        # 缓存锁（用于线程安全操作）
        self._cache_lock = threading.RLock()
        
        # 确保缓存目录存在
        self._ensure_cache_dir()
        
        # 加载统计信息
        self._load_stats()
    
    def _ensure_cache_dir(self):
        """确保缓存目录存在"""
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir, exist_ok=True)
            
        # 创建子目录
        for subdir in ["images", "documents", "thumbnails", "temp"]:
            path = os.path.join(self.cache_dir, subdir)
            if not os.path.exists(path):
                os.makedirs(path, exist_ok=True)
    
    def _load_stats(self):
        """加载缓存统计信息"""
        stats_file = os.path.join(self.cache_dir, "cache_stats.json")
        if os.path.exists(stats_file):
            try:
                with open(stats_file, 'r', encoding='utf-8') as f:
                    self.stats = json.load(f)
            except Exception as e:
                print(f"无法加载缓存统计信息: {e}")
                # 如果加载失败，使用默认值并重新计算
                self.update_cache_stats()
        else:
            # 如果统计文件不存在，计算当前缓存状态
            self.update_cache_stats()
    
    def _save_stats(self):
        """保存缓存统计信息"""
        stats_file = os.path.join(self.cache_dir, "cache_stats.json")
        try:
            with open(stats_file, 'w', encoding='utf-8') as f:
                json.dump(self.stats, f, indent=2)
        except Exception as e:
            print(f"无法保存缓存统计信息: {e}")
    
    def update_cache_stats(self):
        """更新缓存统计信息"""
        with self._cache_lock:
            total_size = 0
            file_count = 0
            
            # 遍历缓存目录
            for root, _, files in os.walk(self.cache_dir):
                for filename in files:
                    if filename == "cache_stats.json":
                        continue
                    file_path = os.path.join(root, filename)
                    try:
                        file_size = os.path.getsize(file_path)
                        total_size += file_size
                        file_count += 1
                    except:
                        pass
            
            self.stats["total_size"] = total_size
            self.stats["file_count"] = file_count
            self._save_stats()
    
    def get_cache_size(self):
        """获取缓存大小（以字节为单位）
        
        Returns:
            int: 缓存大小（字节）
        """
        return self.stats["total_size"]
    
    def get_cache_size_formatted(self):
        """获取格式化的缓存大小
        
        Returns:
            str: 格式化的缓存大小
        """
        size_bytes = self.stats["total_size"]
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes/1024:.2f} KB"
        elif size_bytes < 1024 * 1024 * 1024:
            return f"{size_bytes/(1024*1024):.2f} MB"
        else:
            return f"{size_bytes/(1024*1024*1024):.2f} GB"
    
    def get_cache_stats(self):
        """获取缓存统计信息
        
        Returns:
            dict: 缓存统计信息
        """
        return self.stats.copy()
    
    def clear_cache(self, category=None):
        """清除缓存
        
        Args:
            category (str, optional): 要清除的缓存类别 (images, documents, thumbnails, temp)
                                    如果为None，则清除所有缓存
        
        Returns:
            bool: 操作是否成功
        """
        with self._cache_lock:
            try:
                if category is None:
                    # 清除所有缓存
                    for subdir in ["images", "documents", "thumbnails", "temp"]:
                        path = os.path.join(self.cache_dir, subdir)
                        if os.path.exists(path):
                            for item in os.listdir(path):
                                item_path = os.path.join(path, item)
                                if os.path.isfile(item_path):
                                    os.remove(item_path)
                else:
                    # 清除特定类别的缓存
                    path = os.path.join(self.cache_dir, category)
                    if os.path.exists(path):
                        for item in os.listdir(path):
                            item_path = os.path.join(path, item)
                            if os.path.isfile(item_path):
                                os.remove(item_path)
                
                # 更新统计信息
                self.update_cache_stats()
                return True
            except Exception as e:
                print(f"清除缓存失败: {e}")
                return False
    
    def cleanup_old_cache(self, days=7):
        """清理旧的缓存文件
        
        Args:
            days (int): 清理超过指定天数的缓存文件
        
        Returns:
            tuple: (清理的文件数, 释放的空间大小)
        """
        with self._cache_lock:
            try:
                cleaned_count = 0
                freed_space = 0
                cutoff_time = time.time() - (days * 24 * 60 * 60)
                
                # 遍历缓存目录
                for subdir in ["images", "documents", "thumbnails", "temp"]:
                    path = os.path.join(self.cache_dir, subdir)
                    if os.path.exists(path):
                        for item in os.listdir(path):
                            item_path = os.path.join(path, item)
                            if os.path.isfile(item_path):
                                file_time = os.path.getmtime(item_path)
                                if file_time < cutoff_time:
                                    file_size = os.path.getsize(item_path)
                                    os.remove(item_path)
                                    cleaned_count += 1
                                    freed_space += file_size
                
                # 更新统计信息
                self.update_cache_stats()
                self.stats["last_cleanup"] = datetime.now().isoformat()
                self._save_stats()
                
                return (cleaned_count, freed_space)
            except Exception as e:
                print(f"清理旧缓存失败: {e}")
                return (0, 0)
    
    def get_cache_entry(self, key, category="documents"):
        """获取缓存条目
        
        Args:
            key (str): 缓存键
            category (str): 缓存类别
        
        Returns:
            dict or None: 缓存数据
        """
        with self._cache_lock:
            try:
                cache_file = os.path.join(self.cache_dir, category, f"{key}.json")
                if os.path.exists(cache_file):
                    with open(cache_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        self.stats["cache_hits"] += 1
                        self._save_stats()
                        return data
                else:
                    self.stats["cache_misses"] += 1
                    self._save_stats()
                    return None
            except Exception as e:
                print(f"获取缓存失败: {e}")
                self.stats["cache_misses"] += 1
                self._save_stats()
                return None
    
    def set_cache_entry(self, key, data, category="documents"):
        """设置缓存条目
        
        Args:
            key (str): 缓存键
            data (dict): 要缓存的数据
            category (str): 缓存类别
        
        Returns:
            bool: 操作是否成功
        """
        with self._cache_lock:
            try:
                cache_file = os.path.join(self.cache_dir, category, f"{key}.json")
                with open(cache_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                
                # 更新统计信息
                self.update_cache_stats()
                return True
            except Exception as e:
                print(f"设置缓存失败: {e}")
                return False
    
    def invalidate_cache_entry(self, key, category="documents"):
        """使缓存条目失效（删除）
        
        Args:
            key (str): 缓存键
            category (str): 缓存类别
        
        Returns:
            bool: 操作是否成功
        """
        with self._cache_lock:
            try:
                cache_file = os.path.join(self.cache_dir, category, f"{key}.json")
                if os.path.exists(cache_file):
                    os.remove(cache_file)
                    self.update_cache_stats()
                    return True
                return False
            except Exception as e:
                print(f"删除缓存失败: {e}")
                return False 