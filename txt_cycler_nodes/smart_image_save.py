from PIL import Image
import numpy as np
import os
import re
import time
import torch
import json
from pathlib import Path

class SmartImageSave:
    """
    智能图像保存节点，能够：
    1. 从输入文本中提取文件名（冒号前的文本）
    2. 自动为文件添加编号
    3. 保存图像到ComfyUI的output目录
    4. 输出触发信号，可连接到其他节点
    """
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "images": ("IMAGE",),
                "prompt_text": ("STRING", {"default": "Untitled:图像描述", "multiline": True}),
                "save_prefix": ("STRING", {"default": "img", "multiline": False}),
                "file_type": (["png", "jpg", "webp"], {"default": "png"}),
                "quality": ("INT", {"default": 95, "min": 1, "max": 100, "step": 1}),
            },
            "optional": {
                "custom_output_dir": ("STRING", {"default": "", "multiline": False}),
            }
        }
    
    RETURN_TYPES = ("INT",)
    RETURN_NAMES = ("trigger_signal",)
    FUNCTION = "save_images"
    CATEGORY = "image/save"
    OUTPUT_NODE = True
    
    def __init__(self):
        self.output_dir = self.get_output_dir()
        self.counters = {}  # 用于跟踪不同文件名的编号
        self.last_saved_path = None
    
    def get_output_dir(self):
        """获取ComfyUI的output目录"""
        try:
            import folder_paths
            return folder_paths.get_output_directory()
        except:
            # 如果无法导入，则使用相对路径
            return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "output")
    
    def extract_filename(self, text):
        """从文本中提取冒号前的内容作为文件名"""
        if ":" in text:
            filename = text.split(":", 1)[0].strip()
            # 替换非法字符
            filename = re.sub(r'[\\/*?:"<>|]', "_", filename)
            return filename if filename else "Untitled"
        return "Untitled"
    
    def get_next_number(self, base_name):
        """获取文件的下一个编号"""
        if base_name not in self.counters:
            # 查找目录中已有的最大编号
            max_num = 0
            pattern = re.compile(rf"{re.escape(base_name)}_(\d+)\.(png|jpg|jpeg|webp)")
            
            for file in os.listdir(self.output_dir):
                match = pattern.match(file)
                if match:
                    num = int(match.group(1))
                    max_num = max(max_num, num)
            
            self.counters[base_name] = max_num
        
        # 递增计数器
        self.counters[base_name] += 1
        return self.counters[base_name]
    
    def save_images(self, images, prompt_text, save_prefix, file_type="png", quality=95, custom_output_dir=None):
        # 确定输出目录
        output_dir = custom_output_dir if custom_output_dir and os.path.isdir(custom_output_dir) else self.output_dir
        
        # 确保输出目录存在
        os.makedirs(output_dir, exist_ok=True)
        
        # 从提示文本中提取文件名
        extracted_name = self.extract_filename(prompt_text)
        base_name = f"{save_prefix}_{extracted_name}" if extracted_name != "Untitled" else save_prefix
        
        # 保存每张图像
        saved_paths = []
        for i, image in enumerate(images):
            # 获取下一个编号
            num = self.get_next_number(base_name)
            
            # 准备保存路径
            filename = f"{base_name}_{num:04d}.{file_type}"
            save_path = os.path.join(output_dir, filename)
            
            # 保存图像
            i = 255. * image.cpu().numpy()
            img = Image.fromarray(np.clip(i, 0, 255).astype(np.uint8))
            
            if file_type.lower() == "png":
                img.save(save_path, format="PNG")
            elif file_type.lower() == "jpg" or file_type.lower() == "jpeg":
                img.save(save_path, format="JPEG", quality=quality)
            elif file_type.lower() == "webp":
                img.save(save_path, format="WEBP", quality=quality)
            
            saved_paths.append(save_path)
        
        # 保存最后一个路径作为状态
        if saved_paths:
            self.last_saved_path = saved_paths[-1]
            print(f"已保存图像: {', '.join(saved_paths)}")
        
        # 返回当前时间戳作为触发信号（整数）
        return (int(time.time()),)
    
    @classmethod
    def IS_CHANGED(cls, images, prompt_text, save_prefix, file_type, quality, custom_output_dir=None):
        # 返回固定值，避免递归和计算问题
        return float("NaN")

# 注册节点
NODE_CLASS_MAPPINGS = {
    "SmartImageSave": SmartImageSave
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "SmartImageSave": "智能图像保存"
} 