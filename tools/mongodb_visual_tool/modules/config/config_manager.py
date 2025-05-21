#!/usr/bin/env python3
"""
配置管理模块 - 处理用户配置的加载和保存
"""
import os
import json
from .settings import CONFIG_FILE, DEFAULT_CONFIG

class ConfigManager:
    """用户配置管理类"""
    
    @staticmethod
    def load_config():
        """加载用户配置
        
        Returns:
            dict: 用户配置，如果加载失败则返回默认配置
        """
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading config: {e}")
        return DEFAULT_CONFIG.copy()
    
    @staticmethod
    def save_config(config):
        """保存用户配置
        
        Args:
            config (dict): 要保存的用户配置
        """
        try:
            with open(CONFIG_FILE, 'w') as f:
                json.dump(config, f, indent=2)
        except Exception as e:
            print(f"Error saving config: {e}")
    
    @staticmethod
    def update_config(key, value):
        """更新单个配置项并保存
        
        Args:
            key (str): 配置项键名
            value: 配置项值
        """
        config = ConfigManager.load_config()
        config[key] = value
        ConfigManager.save_config(config)
    
    @staticmethod
    def get_config_value(key, default=None):
        """获取配置项值
        
        Args:
            key (str): 配置项键名
            default: 如果配置项不存在则返回的默认值
            
        Returns:
            配置项的值或默认值
        """
        config = ConfigManager.load_config()
        return config.get(key, default) 