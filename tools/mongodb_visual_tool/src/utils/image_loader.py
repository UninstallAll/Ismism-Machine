#!/usr/bin/env python3
"""
Image Loader - Asynchronously load images using threads
"""
import threading
import queue
import time
import tkinter as tk

class ImageLoader:
    """Asynchronous image loader using thread pool to load images"""
    
    def __init__(self, callback, num_workers=4):
        """Initialize image loader
        
        Args:
            callback (callable): Callback function when image loading completes
            num_workers (int): Number of worker threads
        """
        self.queue = queue.Queue()
        self.running = True
        self.callback = callback
        self.threads = []
        self.num_workers = num_workers
        for _ in range(self.num_workers):
            t = threading.Thread(target=self._process_queue)
            t.daemon = True
            t.start()
            self.threads.append(t)
    
    def add_task(self, card):
        """Add image loading task
        
        Args:
            card: Card object containing the image
        """
        if self._is_widget_valid(card):
            self.queue.put(card)
    
    def queue_image(self, card):
        """Add image loading task (alias for add_task)
        
        Args:
            card: Card object containing the image
        """
        self.add_task(card)
    
    def _process_queue(self):
        """Process image loading tasks from queue"""
        while self.running:
            try:
                # Get card from queue
                card = self.queue.get(timeout=0.5)
                
                # Check if card is still valid (not destroyed)
                if not self._is_widget_valid(card):
                    print("Card has been destroyed, skipping loading")
                    self.queue.task_done()
                    continue
                
                # Load image
                try:
                    success = card.load_image()
                    
                    # Call callback (if card and callback are still valid)
                    if self.callback and self._is_widget_valid(card):
                        self.callback(card, success)
                except tk.TclError as e:
                    if "invalid command name" in str(e):
                        print("UI component has been destroyed, skipping update")
                    else:
                        print(f"Tkinter error: {str(e)}")
                except Exception as e:
                    print(f"Error occurred during image loading: {str(e)}")
                
                # Mark task as done
                self.queue.task_done()
                
                # Brief pause to reduce CPU load
                time.sleep(0.005)
            except queue.Empty:
                # Queue empty, wait for new tasks
                time.sleep(0.05)
            except Exception as e:
                print(f"Image loading error: {str(e)}")
                # Continue processing next task
                continue
    
    def _is_widget_valid(self, widget):
        """Check if widget is still valid (not destroyed)
        
        Args:
            widget: Tkinter widget
            
        Returns:
            bool: Whether valid
        """
        try:
            return widget is not None and widget.winfo_exists()
        except:
            return False
    
    def stop(self):
        """Stop the image loader"""
        self.running = False
        for t in self.threads:
            if t.is_alive():
                t.join(timeout=1.0)
            
    def clear_queue(self):
        """Clear all tasks from the queue"""
        with self.queue.mutex:
            self.queue.queue.clear()
            
    def get_queue_size(self):
        """Get number of pending tasks in the queue
        
        Returns:
            int: Queue size
        """
        return self.queue.qsize() 