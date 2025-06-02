import os
import re
import json
from pathlib import Path
import numpy as np
import random
import glob
import time

class WildcardPromptCyclerNode:
    """
    A node that reads prompts from a text file line by line and cycles through them.
    Each line in the text file is considered a separate prompt.
    Supports wildcards in the format $wildcard$ which will be replaced with a random line from a wildcard file.
    The node displays a countdown of remaining uses directly in the UI.
    It can receive a trigger signal to decrease the usage count.
    """
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "text_file": ("STRING", {"default": "", "multiline": False}),
                "uses_per_prompt": ("INT", {"default": 1, "min": 1, "max": 100, "step": 1}),
                "enable_loop": ("BOOLEAN", {"default": True}),
                "reset_counter": ("BOOLEAN", {"default": False}),
                "wildcards_dir": ("STRING", {"default": "wildcards", "multiline": False}),
                "seed": ("INT", {"default": 0, "min": 0, "max": 0xffffffffffffffff}),
            },
            "optional": {
                "trigger_signal": ("INT", {"default": 0}),  # 接受整数类型作为触发信号，增加默认值
            }
        }
    
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "process"
    CATEGORY = "prompt"
    
    def __init__(self):
        self.current_line_index = 0
        self.remaining_uses = 0
        self.lines = []
        self.last_file = ""
        self.total_uses = 1
        self.last_trigger = None
        self.wildcard_cache = {}
        self.last_seed = 0
    
    def load_wildcard(self, wildcard_name, wildcards_dir):
        """Load wildcard file content and return a random line"""
        wildcard_path = os.path.join(wildcards_dir, f"{wildcard_name}.txt")
        
        # Try to find the wildcard file with a glob pattern if not found directly
        if not os.path.exists(wildcard_path):
            possible_files = glob.glob(os.path.join(wildcards_dir, "**", f"{wildcard_name}.txt"), recursive=True)
            if possible_files:
                wildcard_path = possible_files[0]
            else:
                return f"[Wildcard not found: {wildcard_name}]"
        
        # Check if the wildcard is already in cache
        if wildcard_path in self.wildcard_cache:
            lines = self.wildcard_cache[wildcard_path]
        else:
            # Read wildcard file
            try:
                with open(wildcard_path, 'r', encoding='utf-8') as f:
                    lines = [line.strip() for line in f.readlines() if line.strip() and not line.strip().startswith('#')]
                self.wildcard_cache[wildcard_path] = lines
            except Exception as e:
                return f"[Error loading wildcard {wildcard_name}: {str(e)}]"
            
        if not lines:
            return f"[Wildcard file {wildcard_name} is empty]"
            
        # Return a random line
        return random.choice(lines)
    
    def process_wildcards(self, text, wildcards_dir, seed):
        """Replace all wildcards in the text with random selections from wildcard files"""
        # Set the random seed for reproducibility
        random.seed(seed)
        
        # Find all wildcards in the format $wildcard$
        wildcard_pattern = r'\$([^$]+)\$'
        wildcards = re.findall(wildcard_pattern, text)
        
        # Replace each wildcard
        result = text
        for wildcard in wildcards:
            replacement = self.load_wildcard(wildcard, wildcards_dir)
            result = result.replace(f"${wildcard}$", replacement, 1)
        
        return result
    
    def process(self, text_file, uses_per_prompt, enable_loop, reset_counter, wildcards_dir, seed, trigger_signal=None):
        # Reset if file changed or reset_counter is True
        if text_file != self.last_file or reset_counter:
            self.current_line_index = 0
            self.remaining_uses = uses_per_prompt
            self.last_file = text_file
            self.total_uses = uses_per_prompt
            
            # Read the file
            if os.path.exists(text_file):
                with open(text_file, 'r', encoding='utf-8') as f:
                    # Read all non-empty lines
                    self.lines = [line.strip() for line in f.readlines() if line.strip() and not line.strip().startswith('#')]
            else:
                self.lines = ["File not found: " + text_file]
        
        # Reset wildcard cache if seed changed
        if seed != self.last_seed:
            self.wildcard_cache = {}
            self.last_seed = seed
        
        # 简化触发信号处理逻辑
        if trigger_signal is not None and trigger_signal != self.last_trigger:
            self.last_trigger = trigger_signal
            self.remaining_uses -= 1
            print(f"收到触发信号，剩余使用次数: {self.remaining_uses}")
        
        # Check if we need to move to the next prompt
        if self.remaining_uses <= 0:
            self.remaining_uses = uses_per_prompt
            self.total_uses = uses_per_prompt
            self.current_line_index += 1
            
            # Handle looping
            if len(self.lines) > 0:
                if self.current_line_index >= len(self.lines):
                    if enable_loop:
                        self.current_line_index = 0
                    else:
                        self.current_line_index = len(self.lines) - 1
        
        # Get current prompt
        current_prompt = ""
        if len(self.lines) > 0 and self.current_line_index < len(self.lines):
            current_prompt = self.lines[self.current_line_index]
            
            # Process wildcards
            current_prompt = self.process_wildcards(current_prompt, wildcards_dir, seed + self.current_line_index)
        
        # Add the status directly to the prompt
        prompt_with_status = f"{current_prompt} [Line: {self.current_line_index + 1}/{len(self.lines)} | Remaining: {self.remaining_uses}/{self.total_uses}]"
        
        # Ensure we return a proper string value with correct tuple format
        return (prompt_with_status,)
    
    @classmethod
    def IS_CHANGED(cls, text_file, uses_per_prompt, enable_loop, reset_counter, wildcards_dir, seed, trigger_signal=None):
        # 返回固定值，避免递归和计算问题
        return float("NaN")

# Node registration for ComfyUI
NODE_CLASS_MAPPINGS = {
    "WildcardPromptCyclerNode": WildcardPromptCyclerNode
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "WildcardPromptCyclerNode": "Wildcard Prompt Cycler"
} 