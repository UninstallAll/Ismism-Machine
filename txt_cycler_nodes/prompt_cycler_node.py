import os
import re
import json
from pathlib import Path
import numpy as np

class PromptCyclerNode:
    """
    A node that reads prompts from a text file line by line and cycles through them.
    Each line in the text file is considered a separate prompt.
    """
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "text_file": ("STRING", {"default": "", "multiline": False}),
                "uses_per_prompt": ("INT", {"default": 1, "min": 1, "max": 100, "step": 1}),
                "enable_loop": ("BOOLEAN", {"default": True}),
                "show_status_in_prompt": ("BOOLEAN", {"default": False}),
            },
        }
    
    RETURN_TYPES = ("STRING", "INT", "INT")
    RETURN_NAMES = ("prompt", "remaining_uses", "current_line")
    FUNCTION = "process"
    CATEGORY = "prompt"
    
    def __init__(self):
        self.current_line_index = 0
        self.remaining_uses = 0
        self.lines = []
        self.last_file = ""
        self.total_uses = 1
    
    def process(self, text_file, uses_per_prompt, enable_loop, show_status_in_prompt):
        # Reset if file changed
        if text_file != self.last_file:
            self.current_line_index = 0
            self.remaining_uses = 0
            self.last_file = text_file
            self.total_uses = uses_per_prompt
            
            # Read the file
            if os.path.exists(text_file):
                with open(text_file, 'r', encoding='utf-8') as f:
                    # Read all non-empty lines
                    self.lines = [line.strip() for line in f.readlines() if line.strip()]
            else:
                self.lines = ["File not found: " + text_file]
        
        # If no remaining uses or first run, move to next prompt
        if self.remaining_uses <= 0:
            self.remaining_uses = uses_per_prompt
            self.total_uses = uses_per_prompt
            
            # Move to next line
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
        
        # Create status text
        status_text = f"[Line: {self.current_line_index + 1}/{len(self.lines)} | Uses: {self.remaining_uses + 1}/{self.total_uses}]"
        
        # Add status to prompt if enabled
        if show_status_in_prompt:
            current_prompt = f"{status_text} {current_prompt}"
        
        # Decrement remaining uses
        self.remaining_uses -= 1
        
        # If remaining uses is 0, prepare to move to next prompt on next call
        if self.remaining_uses <= 0:
            self.current_line_index += 1
        
        return (current_prompt, self.remaining_uses, self.current_line_index + 1)

# Add a new node that displays the status
class PromptCyclerDisplayNode:
    """
    A node that displays the status of the Prompt Cycler.
    """
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "remaining_uses": ("INT", {"default": 0, "min": 0}),
                "current_line": ("INT", {"default": 1, "min": 1}),
                "total_lines": ("INT", {"default": 1, "min": 1}),
                "total_uses": ("INT", {"default": 1, "min": 1}),
            },
        }
    
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("status",)
    FUNCTION = "process"
    CATEGORY = "prompt"
    
    def process(self, remaining_uses, current_line, total_lines, total_uses):
        status = f"Line: {current_line}/{total_lines} | Uses: {remaining_uses}/{total_uses}"
        return (status,)

# Node registration for ComfyUI
NODE_CLASS_MAPPINGS = {
    "PromptCyclerNode": PromptCyclerNode,
    "PromptCyclerDisplayNode": PromptCyclerDisplayNode
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptCyclerNode": "Prompt Cycler",
    "PromptCyclerDisplayNode": "Prompt Cycler Display"
} 