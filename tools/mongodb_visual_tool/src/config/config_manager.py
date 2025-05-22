#!/usr/bin/env python3
"""
MongoDB Visual Tool - Configuration Manager
"""
import os
import json
from .settings import DEFAULT_MONGODB_URI, DEFAULT_GRID_COLUMNS

# Configuration file path
CONFIG_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "user_config.json")

# Default configuration
DEFAULT_CONFIG = {
    "last_db": "",
    "last_collection": "",
    "auto_connect": True,
    "mongodb_uri": DEFAULT_MONGODB_URI,
    "grid_columns": DEFAULT_GRID_COLUMNS
}

class ConfigManager:
    """Configuration Manager"""
    
    @staticmethod
    def load_config():
        """Load user configuration
        
        Returns:
            dict: User configuration
        """
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading configuration file: {e}")
                
        return DEFAULT_CONFIG.copy()
    
    @staticmethod
    def save_config(config):
        """Save user configuration
        
        Args:
            config (dict): User configuration
        """
        try:
            with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving configuration file: {e}") 