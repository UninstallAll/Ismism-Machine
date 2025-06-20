import os
import re
import json
from pathlib import Path
import numpy as np
import time

class PromptCyclerNode:
    """
    A node that reads prompts from a text file line by line and cycles through them.
    Each line in the text file is considered a separate prompt.
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
            },
            "optional": {
                "trigger_signal": ("*", {}),  # This can accept any input as a trigger signal
            }
        }
    
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)
    FUNCTION = "process"
    CATEGORY = "prompt"
    
    def __init__(self):
        self.current_line_index = 0
        self.remaining_uses = 0
        self.lines = []
        self.last_file = ""
        self.total_uses = 1
        self.last_trigger = None
    
    def process(self, text_file, uses_per_prompt, enable_loop, reset_counter, trigger_signal=None):
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
                    self.lines = [line.strip() for line in f.readlines() if line.strip()]
            else:
                self.lines = ["File not found: " + text_file]
        
        # Check if we received a new trigger signal
        if trigger_signal is not None and trigger_signal != self.last_trigger:
            self.last_trigger = trigger_signal
            self.remaining_uses -= 1
        
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
        
        # Add the status directly to the prompt
        prompt_with_status = f"{current_prompt} [Line: {self.current_line_index + 1}/{len(self.lines)} | Remaining: {self.remaining_uses}/{self.total_uses}]"
        
        return (prompt_with_status,)
    
    @classmethod
    def IS_CHANGED(cls, text_file, uses_per_prompt, enable_loop, reset_counter, trigger_signal=None):
        # This ensures the node always updates when trigger_signal changes
        return float("NaN")

# Node registration for ComfyUI
NODE_CLASS_MAPPINGS = {
    "PromptCyclerNode": PromptCyclerNode
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptCyclerNode": "Prompt Cycler"
} 