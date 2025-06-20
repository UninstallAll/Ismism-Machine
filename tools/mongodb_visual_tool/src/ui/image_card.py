#!/usr/bin/env python3
"""
Image Card Component - For displaying images and metadata from documents
"""
import os
import tkinter as tk
from tkinter import ttk
from PIL import Image, ImageTk

# Card default dimensions
CARD_WIDTH = 220
CARD_HEIGHT = 180

class ImageCard(ttk.Frame):
    """Card component for displaying images and metadata"""
    
    def __init__(self, parent, doc=None, width=CARD_WIDTH, height=CARD_HEIGHT, on_select_callback=None):
        """Initialize the image card
        
        Args:
            parent: Parent component
            doc (dict, optional): Document data
            width (int, optional): Card width
            height (int, optional): Card height
            on_select_callback (callable, optional): Callback function when selection state changes
        """
        super().__init__(parent)
        
        self.width = width
        self.height = height
        self.doc = doc or {}
        self.metadata = {}
        self.image_path = None
        self.image = None
        self.is_selected = False  # Selection state flag
        self.on_select_callback = on_select_callback
        
        # Default background color
        default_bg = "#f0f0f0"
        
        # Create an extra fixed size container to maintain consistent card size
        self.container = tk.Frame(self, width=width, height=height+80)
        self.container.pack(fill=tk.BOTH, expand=True)
        self.container.pack_propagate(False)  # Prevent container size changes
        
        # Create main frame
        self.main_frame = tk.Frame(self.container, 
                                 background=default_bg,
                                 borderwidth=2,
                                 relief="solid",
                                 highlightthickness=3,
                                 highlightbackground="#d9d9d9",
                                 padx=0, pady=0)
        self.main_frame.pack(fill=tk.BOTH, expand=True, padx=0, pady=0)
        
        # Extract metadata
        self._extract_metadata()
        
        # Create image display area
        self.image_frame = tk.Frame(self.main_frame, width=width-10, height=height-10, background=default_bg)
        self.image_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        self.image_frame.pack_propagate(False)  # Prevent frame shrinking
        
        self.image_label = ttk.Label(self.image_frame, text="Loading...")
        self.image_label.pack(fill=tk.BOTH, expand=True)
        
        # Create metadata display area
        self.meta_frame = tk.Frame(self.main_frame, background=default_bg)
        self.meta_frame.pack(fill=tk.X, padx=5, pady=2)
        
        # Create selection checkbox
        self.select_var = tk.BooleanVar(value=False)
        
        # Create styled selection checkbox
        style = ttk.Style()
        style.configure("Bold.TCheckbutton", font=('TkDefaultFont', 10, 'bold'))
        
        self.select_checkbox = ttk.Checkbutton(self.meta_frame, 
                                             variable=self.select_var,
                                             style="Bold.TCheckbutton",
                                             command=self._on_checkbox_toggle)
        self.select_checkbox.pack(side=tk.LEFT, padx=(8,4), pady=2)
        
        # Display filename or title
        name = self.metadata.get('filename', "Untitled")
        self.name_label = ttk.Label(self.meta_frame, text=name, wraplength=width-40)
        self.name_label.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=8, pady=2)
        
        # Add warning mark if file doesn't exist
        if self.doc.get('_file_missing'):
            warning_label = ttk.Label(self.meta_frame, text="⚠️", foreground="red", 
                                    font=("Arial", 12, "bold"))
            warning_label.pack(side=tk.RIGHT, padx=8, pady=2)
        
        # Add size information (if available)
        info_frame = tk.Frame(self.main_frame, background=default_bg)
        info_frame.pack(fill=tk.X, padx=5, pady=(0,4))
        
        if 'size' in self.metadata:
            size_kb = int(self.metadata['size'] / 1024) if isinstance(self.metadata['size'], (int, float)) else '?'
            size_text = f"Size: {size_kb} KB"
            size_label = ttk.Label(info_frame, text=size_text)
            size_label.pack(side=tk.LEFT, padx=(8, 10), pady=2)
            
        # Add art movement (if available)
        if 'artMovement' in self.metadata:
            movement_label = ttk.Label(info_frame, text=f"Style: {self.metadata['artMovement']}")
            movement_label.pack(side=tk.LEFT, padx=8, pady=2)
        
        # Bind left click event
        self.bind("<Button-1>", self._on_click)
        self.image_label.bind("<Button-1>", self._on_click)
        self.name_label.bind("<Button-1>", self._on_click)
        self.main_frame.bind("<Button-1>", self._on_click)
        self.image_frame.bind("<Button-1>", self._on_click)
        self.meta_frame.bind("<Button-1>", self._on_click)
        info_frame.bind("<Button-1>", self._on_click)
    
    def _extract_metadata(self):
        """Extract metadata from document"""
        if not self.doc:
            return
            
        # Extract image path
        if 'filePath' in self.doc:
            path = self.doc['filePath']
            # 处理相对路径
            if not os.path.isabs(path):
                # 尝试在项目根目录下查找
                project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
                path = os.path.join(project_root, path)
            self.image_path = path
            self.metadata['filepath'] = path
            print(f"Found filePath: {self.image_path} (Absolute: {os.path.isabs(self.image_path)})")
        elif 'imageUrl' in self.doc:
            path = self.doc['imageUrl']
            # 处理相对路径
            if not os.path.isabs(path):
                project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
                path = os.path.join(project_root, path)
            self.image_path = path
            self.metadata['imageurl'] = path
            print(f"Found imageUrl: {self.image_path} (Absolute: {os.path.isabs(self.image_path)})")
        else:
            print(f"No image path found in document: {self.doc.get('_id')}")
                
        # Extract other metadata
        if 'filename' in self.doc:
            self.metadata['filename'] = self.doc['filename']
        elif 'title' in self.doc:
            self.metadata['filename'] = self.doc['title']
                
        if 'size' in self.doc:
            self.metadata['size'] = self.doc['size']
                
        if 'metadata' in self.doc and isinstance(self.doc['metadata'], dict):
            for key, value in self.doc['metadata'].items():
                self.metadata[key] = value
    
    def _on_click(self, event):
        """Handle left click event"""
        if self.on_select_callback:
            self.on_select_callback(self, not self.is_selected, event)
    
    def _on_checkbox_toggle(self, event=None):
        """Handle checkbox state change"""
        self.is_selected = self.select_var.get()
        
        if self.is_selected:
            # Selected state style
            selected_bg = "#1E90FF"
            selected_border = "#0078D7"
            selected_text = "white"
            
            # Main frame settings
            self.main_frame.configure(
                background=selected_bg,
                highlightbackground=selected_border,
                highlightthickness=5,
                borderwidth=3,
                relief="raised"
            )
            
            # Set the same background color for all child frames
            for widget in self.main_frame.winfo_children():
                if isinstance(widget, tk.Frame):
                    widget.configure(background=selected_bg)
            
            # Directly set known child frames
            if hasattr(self, 'image_frame'):
                self.image_frame.configure(background=selected_bg)
            if hasattr(self, 'meta_frame'):
                self.meta_frame.configure(background=selected_bg)
                
            # Change all label text to white
            for frame in self.main_frame.winfo_children():
                if isinstance(frame, tk.Frame):
                    for widget in frame.winfo_children():
                        if isinstance(widget, ttk.Label):
                            widget.configure(foreground=selected_text)
            
            # Ensure filename label color also changes
            if hasattr(self, 'name_label'):
                self.name_label.configure(foreground=selected_text)
                
        else:
            # Unselected state style
            default_bg = "#f0f0f0"
            default_border = "#d9d9d9"
            default_text = "black"
            
            # Main frame settings
            self.main_frame.configure(
                background=default_bg,
                highlightbackground=default_border,
                highlightthickness=3,
                borderwidth=2,
                relief="solid"
            )
            
            # Set the same background color for all child frames
            for widget in self.main_frame.winfo_children():
                if isinstance(widget, tk.Frame):
                    widget.configure(background=default_bg)
                    
            # Directly set known child frames
            if hasattr(self, 'image_frame'):
                self.image_frame.configure(background=default_bg)
            if hasattr(self, 'meta_frame'):
                self.meta_frame.configure(background=default_bg)
                
            # Change all label text back to default color
            for frame in self.main_frame.winfo_children():
                if isinstance(frame, tk.Frame):
                    for widget in frame.winfo_children():
                        if isinstance(widget, ttk.Label):
                            widget.configure(foreground=default_text)
            
            # Ensure filename label color also changes
            if hasattr(self, 'name_label'):
                self.name_label.configure(foreground=default_text)
    
    def set_selected(self, selected):
        """Set selection state
        
        Args:
            selected (bool): Whether to select the card
        """
        if selected != self.select_var.get():
            self.select_var.set(selected)
            self._on_checkbox_toggle(None)
    
    def load_image(self):
        """Load and display image"""
        try:
            if not self.image_path:
                print(f"No image path available for document: {self.doc.get('_id')}")
                self.image_label.configure(text="No image path")
                return False
            
            # 尝试不同的路径组合
            paths_to_try = [
                self.image_path,  # 原始路径
                os.path.abspath(self.image_path),  # 绝对路径
            ]
            
            # 如果是相对路径，尝试在不同的基准目录下查找
            if not os.path.isabs(self.image_path):
                project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
                paths_to_try.extend([
                    os.path.join(project_root, self.image_path),  # 项目根目录
                    os.path.join(project_root, 'public', self.image_path),  # public目录
                    os.path.join(project_root, 'data', self.image_path),  # data目录
                ])
            
            # 尝试所有可能的路径
            image_found = False
            for path in paths_to_try:
                print(f"Trying path: {path}")
                if os.path.exists(path):
                    print(f"Found image at: {path}")
                    self.image_path = path
                    image_found = True
                    break
            
            if not image_found:
                print(f"Image not found in any of these locations: {paths_to_try}")
                self.image_label.configure(text="Image not found")
                return False
            
            print(f"Loading image from: {self.image_path}")
            
            # Open and resize image
            img = Image.open(self.image_path)
            img_width, img_height = img.size
            print(f"Original image size: {img_width}x{img_height}")
            
            # Calculate aspect ratio
            aspect_ratio = img_width / img_height
            
            # Calculate new dimensions to fit in the frame while preserving aspect ratio
            frame_width = self.width - 20
            frame_height = self.height - 20
            
            if img_width > frame_width or img_height > frame_height:
                if aspect_ratio > 1:  # Wider than tall
                    new_width = frame_width
                    new_height = int(frame_width / aspect_ratio)
                else:  # Taller than wide
                    new_height = frame_height
                    new_width = int(frame_height * aspect_ratio)
                    
                print(f"Resizing image to: {new_width}x{new_height}")
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Convert to Tkinter format
            self.image = ImageTk.PhotoImage(img)
            
            # Update image label
            self.image_label.configure(image=self.image, text="")
            print(f"Successfully loaded image for document: {self.doc.get('_id')}")
            return True
            
        except Exception as e:
            print(f"Error loading image for document {self.doc.get('_id')}: {str(e)}")
            import traceback
            traceback.print_exc()
            # Show error message
            self.image_label.configure(text=f"Error: {str(e)}")
            return False
    
    def setup_context_menu(self, callback):
        """Setup context menu
        
        Args:
            callback (callable): Callback function for menu actions
        """
        self.context_menu = tk.Menu(self, tearoff=0)
        self.context_menu.add_command(label="Edit Details", command=lambda: callback("view", self.doc))
        self.context_menu.add_command(label="Export", command=lambda: callback("export", self.doc))
        self.context_menu.add_separator()
        self.context_menu.add_command(label="Delete", command=lambda: callback("delete", self._get_delete_docs()))
        
        # Bind context menu to card
        self.bind("<Button-3>", self._show_context_menu)
        self.image_label.bind("<Button-3>", self._show_context_menu)
        self.name_label.bind("<Button-3>", self._show_context_menu)
    
    def _show_context_menu(self, event):
        """Show context menu at mouse position
        
        Args:
            event: Mouse event
        """
        if hasattr(self, 'context_menu'):
            # 选中该项目
            self.set_selected(True)
            # 显示菜单
            self.context_menu.post(event.x_root, event.y_root)
    
    def bind_select_callback(self, callback):
        """Bind selection callback
        
        Args:
            callback (callable): Callback function for selection change
        """
        self.on_select_callback = callback 
    
    def _get_delete_docs(self):
        # 如果有多选，批量删除，否则只删自己
        grid = self.master.master.master  # cards_frame->canvas->grid_frame->PaginatedGrid
        if hasattr(grid, 'selected_docs') and len(grid.selected_docs) > 0:
            return grid.selected_docs
        return self.doc 