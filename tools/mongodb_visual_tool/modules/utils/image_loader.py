#!/usr/bin/env python3
"""
图像加载器 - 使用线程异步加载图像
"""
import threading
import queue
import time
import tkinter as tk

class ImageLoader:
    """异步图像加载器，使用线程池加载图像"""
    
    def __init__(self, callback):
        """初始化图像加载器
        
        Args:
            callback (callable): 图像加载完成后的回调函数
        """
        self.queue = queue.Queue()
        self.running = True
        self.callback = callback
        self.thread = threading.Thread(target=self._process_queue)
        self.thread.daemon = True
        self.thread.start()
    
    def add_task(self, card):
        """添加图像加载任务
        
        Args:
            card: 包含图像的卡片对象
        """
        self.queue.put(card)
    
    def queue_image(self, card):
        """添加图像加载任务（add_task的别名）
        
        Args:
            card: 包含图像的卡片对象
        """
        self.add_task(card)
    
    def _process_queue(self):
        """处理队列中的图像加载任务"""
        while self.running:
            try:
                # 从队列获取卡片
                card = self.queue.get(timeout=0.5)
                
                # 检查卡片是否还有效（未被销毁）
                if not self._is_widget_valid(card):
                    print("卡片已被销毁，跳过加载")
                    self.queue.task_done()
                    continue
                
                # 加载图像
                try:
                    success = card.load_image()
                    
                    # 调用回调（前提是卡片和回调仍然有效）
                    if self.callback and self._is_widget_valid(card):
                        self.callback(card, success)
                except tk.TclError as e:
                    if "invalid command name" in str(e):
                        print("UI组件已被销毁，跳过更新")
                    else:
                        print(f"Tkinter错误: {str(e)}")
                except Exception as e:
                    print(f"图像加载过程中发生错误: {str(e)}")
                
                # 标记任务完成
                self.queue.task_done()
                
                # 短暂暂停以减轻CPU负担
                time.sleep(0.01)
            except queue.Empty:
                # 队列为空，等待新任务
                time.sleep(0.1)
            except Exception as e:
                print(f"图像加载错误: {str(e)}")
                # 继续处理下一个任务
                continue
    
    def _is_widget_valid(self, widget):
        """检查组件是否仍然有效（未被销毁）
        
        Args:
            widget: Tkinter组件
            
        Returns:
            bool: 是否有效
        """
        try:
            widget.winfo_exists()
            return True
        except:
            return False
    
    def stop(self):
        """停止图像加载器"""
        self.running = False
        if self.thread.is_alive():
            self.thread.join(timeout=1.0)
            
    def clear_queue(self):
        """清空队列中的所有任务"""
        with self.queue.mutex:
            self.queue.queue.clear()
            
    def get_queue_size(self):
        """获取队列中待处理的任务数量
        
        Returns:
            int: 队列大小
        """
        return self.queue.qsize() 