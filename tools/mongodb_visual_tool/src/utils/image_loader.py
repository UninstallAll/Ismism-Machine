#!/usr/bin/env python3
"""
Image Loader - Asynchronously load images using threads
"""
import threading
import queue
import time
import tkinter as tk
import os
from PIL import Image, ImageTk

class ImageLoader:
    """Image loader with thread pool"""
    
    def __init__(self, callback, num_workers=4):
        """Initialize image loader
        
        Args:
            callback (callable): Callback function when image is loaded
            num_workers (int): Number of worker threads
        """
        self.callback = callback
        self.queue = queue.Queue()
        self.workers = []
        self.running = True
        self.current_batch_id = None
        
        # 创建工作线程
        for _ in range(num_workers):
            worker = threading.Thread(target=self._worker_thread)
            worker.daemon = True
            worker.start()
            self.workers.append(worker)
    
    def add_task(self, card, batch_id=None):
        """Add image loading task
        
        Args:
            card: Image card object
            batch_id: Batch ID for task grouping
        """
        self.queue.put((card, batch_id))
    
    def clear_queue(self):
        """Clear pending tasks"""
        try:
            while True:
                self.queue.get_nowait()
                self.queue.task_done()
        except queue.Empty:
            pass
    
    def wait_pending(self):
        """Wait for all pending tasks to complete"""
        self.queue.join()
    
    def _worker_thread(self):
        """Worker thread function"""
        while self.running:
            try:
                card, batch_id = self.queue.get(timeout=1)
                
                # 如果卡片已销毁或批次ID不匹配，跳过加载
                if not card.winfo_exists() or (batch_id and batch_id != getattr(card, 'batch_id', None)):
                    self.queue.task_done()
                    continue
                
                try:
                    # 获取图片路径
                    image_path = None
                    if hasattr(card.doc, 'get'):
                        if 'filePath' in card.doc:
                            image_path = card.doc['filePath']
                        elif 'imageUrl' in card.doc:
                            image_path = card.doc['imageUrl']
                        elif 'portrait_url' in card.doc:
                            image_path = card.doc['portrait_url']
                    
                    if image_path and os.path.exists(image_path):
                        # 加载并调整图片大小
                        image = Image.open(image_path)
                        image.thumbnail((200, 200))  # 调整到合适大小
                        photo = ImageTk.PhotoImage(image)
                        
                        # 更新UI（在主线程中）
                        card.after(0, lambda: self._update_card(card, photo, True))
                    else:
                        # 更新UI（在主线程中）
                        card.after(0, lambda: self._update_card(card, None, False))
                        
                except Exception as e:
                    print(f"Error loading image: {e}")
                    # 更新UI（在主线程中）
                    card.after(0, lambda: self._update_card(card, None, False))
                    
                finally:
                    self.queue.task_done()
                    
            except queue.Empty:
                continue
            except Exception as e:
                print(f"Worker thread error: {e}")
                continue
    
    def _update_card(self, card, photo, success):
        """Update card UI in main thread
        
        Args:
            card: Image card object
            photo: PhotoImage object
            success (bool): Whether loading was successful
        """
        try:
            if card.winfo_exists():
                if success and photo:
                    card.set_image(photo)
                self.callback(card, success)
        except Exception as e:
            print(f"Error updating card: {e}")
    
    def stop(self):
        """Stop worker threads"""
        self.running = False
        for worker in self.workers:
            worker.join() 