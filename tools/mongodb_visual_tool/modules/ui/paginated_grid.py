#!/usr/bin/env python3
"""
Paginated Grid Component - For displaying paginated image cards
"""
import tkinter as tk
from tkinter import ttk, Menu, messagebox
import math
import os
from PIL import Image, ImageTk

from ..config.settings import DEFAULT_PAGE_SIZE
from .image_card import ImageCard
from ..utils.image_loader import ImageLoader

class PaginatedGrid(ttk.Frame):
    """Paginated grid component for displaying image cards"""
    
    def __init__(self, parent, page_size=DEFAULT_PAGE_SIZE):
        """Initialize paginated grid
        
        Args:
            parent: Parent widget
            page_size (int, optional): Number of items per page
        """
        super().__init__(parent)
        
        # Basic properties
        self.parent = parent
        self.page_size = page_size
        self.columns = 3  # Default column count
        self.current_page = 1
        self.total_pages = 1
        self.all_items = []  # All items
        self.filtered_items = []  # Filtered items
        self.displayed_cards = []  # Currently displayed cards
        self.selected_docs = []  # Selected documents
        self.context_menu_callback = None
        self.current_view = "grid"  # Default view mode (grid or list)
        
        # Control key states
        self.ctrl_pressed = False
        self.shift_pressed = False
        
        # Mouse drag selection
        self.drag_start_x = 0
        self.drag_start_y = 0
        self.is_dragging = False
        self.selection_rect = None
        
        # Search history
        self.search_history = []
        
        # Create UI
        self._create_ui()
        
        # Create image loader
        self.image_loader = ImageLoader(self._on_image_loaded)
        
        # Bind keyboard shortcuts
        self._bind_keyboard_shortcuts()
        
    def _bind_keyboard_shortcuts(self):
        """Bind keyboard shortcuts"""
        # Bind Ctrl key press and release events
        self.bind_all("<Control-KeyPress>", self._on_ctrl_key_press)
        self.bind_all("<Control-KeyRelease>", self._on_ctrl_key_release)
        
        # Bind Shift key press and release events
        self.bind_all("<Shift-KeyPress>", self._on_shift_key_press)
        self.bind_all("<Shift-KeyRelease>", self._on_shift_key_release)
        
        # Bind combination keys
        self.bind_all("<Control-a>", self._select_all_shortcut)
        self.bind_all("<Control-d>", self._deselect_all_shortcut)
        self.bind_all("<Control-i>", self._invert_selection_shortcut)
    
    def _on_ctrl_key_press(self, event):
        """Handle Ctrl key press event"""
        self.ctrl_pressed = True
    
    def _on_ctrl_key_release(self, event):
        """Handle Ctrl key release event"""
        self.ctrl_pressed = False
    
    def _on_shift_key_press(self, event):
        """Handle Shift key press event"""
        self.shift_pressed = True
    
    def _on_shift_key_release(self, event):
        """Handle Shift key release event"""
        self.shift_pressed = False
    
    def _select_all_shortcut(self, event):
        """Handle select all shortcut"""
        for card in self.displayed_cards:
            card.set_selected(True)
        self._update_selection_ui()
        return "break"  # Prevent event propagation
    
    def _deselect_all_shortcut(self, event):
        """Handle deselect all shortcut"""
        for card in self.displayed_cards:
            card.set_selected(False)
        self._update_selection_ui()
        return "break"
    
    def _invert_selection_shortcut(self, event):
        """Handle invert selection shortcut"""
        for card in self.displayed_cards:
            card.set_selected(not card.is_selected)
        self._update_selection_ui()
        return "break"
        
    def _create_ui(self):
        """Create UI components"""
        # Main frame
        self.main_frame = ttk.Frame(self)
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Top toolbar
        self.toolbar = ttk.Frame(self.main_frame)
        self.toolbar.pack(fill=tk.X, padx=5, pady=5)
        
        # Add search box
        ttk.Label(self.toolbar, text="Search:").pack(side=tk.LEFT, padx=(0, 5))
        
        self.search_var = tk.StringVar()
        self.search_var.trace("w", self._on_search_text_changed)
        
        self.search_entry = ttk.Entry(self.toolbar, width=30, textvariable=self.search_var)
        self.search_entry.pack(side=tk.LEFT, padx=5)
        self.search_entry.bind("<Return>", self._on_search)
        
        # Search button
        self.search_button = ttk.Button(self.toolbar, text="Search", command=self._on_search)
        self.search_button.pack(side=tk.LEFT, padx=5)
        
        # Clear search button
        self.clear_button = ttk.Button(self.toolbar, text="Clear", command=self._clear_search)
        self.clear_button.pack(side=tk.LEFT, padx=5)
        
        # Search history button
        self.history_button = ttk.Button(self.toolbar, text="History", command=self._show_search_history)
        self.history_button.pack(side=tk.LEFT, padx=5)
        
        # View toggle button
        self.view_button = ttk.Button(self.toolbar, text="Toggle View", command=self._switch_view_mode)
        self.view_button.pack(side=tk.LEFT, padx=5)
        
        # Bulk operations buttons
        self.operations_frame = ttk.Frame(self.toolbar)
        self.operations_frame.pack(side=tk.RIGHT)
        
        ttk.Button(self.operations_frame, text="Select All", command=self._toggle_select_all).pack(side=tk.LEFT, padx=2)
        ttk.Button(self.operations_frame, text="Bulk Export", command=self._bulk_export).pack(side=tk.LEFT, padx=2)
        ttk.Button(self.operations_frame, text="Create Relation", command=self._bulk_create_relation).pack(side=tk.LEFT, padx=2)
        
        # Create list and grid view containers
        self.view_container = ttk.Frame(self.main_frame)
        self.view_container.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # List view - Treeview
        self.list_frame = ttk.Frame(self.view_container)
        
        columns = ("Filename", "Type", "Size")
        self.list_view = ttk.Treeview(self.list_frame, columns=columns, show="headings", selectmode="extended")
        
        for col in columns:
            self.list_view.heading(col, text=col)
            self.list_view.column(col, width=100)
        
        vsb = ttk.Scrollbar(self.list_frame, orient="vertical", command=self.list_view.yview)
        hsb = ttk.Scrollbar(self.list_frame, orient="horizontal", command=self.list_view.xview)
        self.list_view.configure(yscrollcommand=vsb.set, xscrollcommand=hsb.set)
        
        vsb.pack(side=tk.RIGHT, fill=tk.Y)
        hsb.pack(side=tk.BOTTOM, fill=tk.X)
        self.list_view.pack(fill=tk.BOTH, expand=True)
        
        # Grid view - Canvas + Frame
        self.grid_frame = ttk.Frame(self.view_container)
        
        # Use Canvas for scrolling support
        self.canvas = tk.Canvas(self.grid_frame, borderwidth=0, highlightthickness=0)
        self.scrollbar = ttk.Scrollbar(self.grid_frame, orient=tk.VERTICAL, command=self.canvas.yview)
        self.canvas.configure(yscrollcommand=self.scrollbar.set)
        
        self.scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # Inner frame for cards placement
        self.cards_frame = ttk.Frame(self.canvas)
        self.canvas_window = self.canvas.create_window((0, 0), window=self.cards_frame, anchor=tk.NW)
        
        # Set grid view as default
        self.grid_frame.pack(fill=tk.BOTH, expand=True)
        
        # Pagination frame
        self.pagination_frame = ttk.Frame(self.main_frame)
        self.pagination_frame.pack(fill=tk.X, padx=5, pady=5)
        
        # Previous page button
        self.prev_button = ttk.Button(self.pagination_frame, text="< Previous", command=self.prev_page)
        self.prev_button.pack(side=tk.LEFT, padx=5)
        
        # Page info
        self.page_info = ttk.Label(self.pagination_frame, text="Page 1 of 1")
        self.page_info.pack(side=tk.LEFT, padx=5)
        
        # Next page button
        self.next_button = ttk.Button(self.pagination_frame, text="Next >", command=self.next_page)
        self.next_button.pack(side=tk.LEFT, padx=5)
        
        # Page size selector
        ttk.Label(self.pagination_frame, text="Items per page:").pack(side=tk.LEFT, padx=(20, 5))
        self.page_size_var = tk.StringVar(value=str(self.page_size))
        page_size_combo = ttk.Combobox(self.pagination_frame, textvariable=self.page_size_var, 
                                      values=["12", "24", "48", "96"], width=5)
        page_size_combo.pack(side=tk.LEFT)
        page_size_combo.bind("<<ComboboxSelected>>", self._on_page_size_changed)
        
        # Bind events
        self.bind_mousewheel()
        self.canvas.bind("<Configure>", self._on_canvas_configure)
        self.cards_frame.bind("<Configure>", self._on_frame_configure)
        
        # Mouse selection bindings
        self.canvas.bind("<ButtonPress-1>", self._on_mouse_down)
        self.canvas.bind("<B1-Motion>", self._on_mouse_drag)
        self.canvas.bind("<ButtonRelease-1>", self._on_mouse_release)

    def _switch_view_mode(self):
        """Switch between grid and list view modes"""
        if self.current_view == "grid":
            self.current_view = "list"
            self.grid_frame.pack_forget()
            self.list_frame.pack(fill=tk.BOTH, expand=True)
            self.view_button.configure(text="Grid View")
        else:
            self.current_view = "grid"
            self.list_frame.pack_forget()
            self.grid_frame.pack(fill=tk.BOTH, expand=True)
            self.view_button.configure(text="List View")
    
    def set_context_menu_callback(self, callback):
        """Set context menu callback"""
        self.context_menu_callback = callback
    
    def _on_image_loaded(self, card, success):
        """Image load callback"""
        # This method is called when an image is loaded
        pass
    
    def refresh_grid(self):
        """Refresh grid display"""
        # Clear current cards
        for widget in self.cards_frame.winfo_children():
            widget.destroy()
        self.displayed_cards = []
        
        # Get items for current page
        start_idx = (self.current_page - 1) * self.page_size
        end_idx = start_idx + self.page_size
        page_items = self.filtered_items[start_idx:end_idx]
        
        # Create cards
        row, col = 0, 0
        for doc in page_items:
            card = ImageCard(self.cards_frame, doc)
            card.grid(row=row, column=col, padx=5, pady=5, sticky='nsew')
            card.setup_context_menu(self._show_context_menu)
            card.bind_select_callback(self._on_card_selected)
            
            self.displayed_cards.append(card)
            self.image_loader.queue_image(card)
            
            # Move to next position
            col += 1
            if col >= self.columns:
                col = 0
                row += 1
        
        # Update UI
        self._update_pagination_controls()
    
    def refresh_list(self):
        """Refresh list view"""
        # Clear list
        for item in self.list_view.get_children():
            self.list_view.delete(item)
        
        # Get items for current page
        start_idx = (self.current_page - 1) * self.page_size
        end_idx = start_idx + self.page_size
        page_items = self.filtered_items[start_idx:end_idx]
        
        # Add items to list
        for doc in page_items:
            filename = doc.get('filename', 'Unnamed')
            doctype = doc.get('metadata', {}).get('type', '')
            size = doc.get('size', 0)
            size_str = f"{int(size/1024) if isinstance(size, (int, float)) else 0} KB"
            
            item_id = self.list_view.insert('', 'end', values=(filename, doctype, size_str))
            # Store document reference with the item
            self.list_view.item(item_id, tags=(str(doc.get('_id', '')),))
        
        # Update UI
        self._update_pagination_controls()
    
    def _on_card_selected(self, card, is_selected):
        """Handle card selection event"""
        if is_selected:
            if card.doc not in self.selected_docs:
                self.selected_docs.append(card.doc)
        else:
            if card.doc in self.selected_docs:
                self.selected_docs.remove(card.doc)
        
        self._update_selection_ui()
    
    def _update_selection_ui(self):
        """Update selection state UI"""
        selected_count = len(self.selected_docs)
        if selected_count > 0:
            for btn in self.operations_frame.winfo_children():
                btn.configure(state=tk.NORMAL)
        else:
            for btn in self.operations_frame.winfo_children()[1:]:  # Skip "Select All" button
                btn.configure(state=tk.DISABLED)
    
    def _toggle_select_all(self):
        """Toggle select all state"""
        # Check if all are selected
        all_selected = all(card.is_selected for card in self.displayed_cards)
        
        # Toggle selection state
        for card in self.displayed_cards:
            card.set_selected(not all_selected)
        
        self._update_selection_ui()
    
    def _bulk_export(self):
        """Export documents in bulk"""
        if self.context_menu_callback:
            self.context_menu_callback("bulk_export", self.selected_docs)
    
    def _bulk_create_relation(self):
        """Create relationships in bulk"""
        if self.context_menu_callback:
            self.context_menu_callback("create_relation", self.selected_docs)
    
    def _on_frame_configure(self, event):
        """Handle frame resize"""
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))
    
    def _on_canvas_configure(self, event):
        """Handle canvas resize"""
        # Adjust the canvas window width to fill the canvas
        self.canvas.itemconfig(self.canvas_window, width=event.width)
    
    def _on_mousewheel(self, event):
        """Handle mousewheel event"""
        # Process mousewheel for scrolling
        self.canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
    
    def bind_mousewheel(self):
        """Bind mousewheel events"""
        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)
    
    def unbind_mousewheel(self):
        """Unbind mousewheel events"""
        self.canvas.unbind_all("<MouseWheel>")
    
    def _on_mouse_down(self, event):
        """Handle mouse down event"""
        if not self.ctrl_pressed and not self.shift_pressed:
            # Start drag selection
            self.drag_start_x = self.canvas.canvasx(event.x)
            self.drag_start_y = self.canvas.canvasy(event.y)
            self.is_dragging = True
    
    def _on_mouse_drag(self, event):
        """Handle mouse drag event"""
        if self.is_dragging:
            # Get current position
            x = self.canvas.canvasx(event.x)
            y = self.canvas.canvasy(event.y)
            
            # Delete previous selection rectangle
            if self.selection_rect:
                self.canvas.delete(self.selection_rect)
            
            # Draw new selection rectangle
            self.selection_rect = self.canvas.create_rectangle(
                self.drag_start_x, self.drag_start_y, x, y,
                outline="blue", width=2, dash=(4, 4)
            )
    
    def _on_mouse_release(self, event):
        """Handle mouse release event"""
        if self.is_dragging and self.selection_rect:
            # Get coordinates
            x1 = self.drag_start_x
            y1 = self.drag_start_y
            x2 = self.canvas.canvasx(event.x)
            y2 = self.canvas.canvasy(event.y)
            
            # Select cards in rectangle
            self._select_cards_in_rectangle(x1, y1, x2, y2)
            
            # Clean up
            self.canvas.delete(self.selection_rect)
            self.selection_rect = None
            self.is_dragging = False
    
    def _select_cards_in_rectangle(self, x1, y1, x2, y2):
        """Select cards that intersect with rectangle"""
        # Ensure x1,y1 is top-left and x2,y2 is bottom-right
        if x2 < x1:
            x1, x2 = x2, x1
        if y2 < y1:
            y1, y2 = y2, y1
        
        # Check each card
        for card in self.displayed_cards:
            # Get card's position and size on canvas
            card_x = card.winfo_x()
            card_y = card.winfo_y()
            card_width = card.winfo_width()
            card_height = card.winfo_height()
            
            # Check if card intersects selection rectangle
            if (card_x + card_width > x1 and card_x < x2 and
                card_y + card_height > y1 and card_y < y2):
                # Select this card
                card.set_selected(True)
        
        # Update selection UI
        self._update_selection_ui()
    
    def next_page(self):
        """Go to next page"""
        if self.current_page < self.total_pages:
            self.current_page += 1
            if self.current_view == "grid":
                self.refresh_grid()
            else:
                self.refresh_list()
    
    def prev_page(self):
        """Go to previous page"""
        if self.current_page > 1:
            self.current_page -= 1
            if self.current_view == "grid":
                self.refresh_grid()
            else:
                self.refresh_list()
    
    def _update_pagination_controls(self):
        """Update pagination controls"""
        self.page_info.config(text=f"Page {self.current_page} of {self.total_pages}")
        
        # Enable/disable navigation buttons
        self.prev_button.config(state=tk.NORMAL if self.current_page > 1 else tk.DISABLED)
        self.next_button.config(state=tk.NORMAL if self.current_page < self.total_pages else tk.DISABLED)
    
    def _on_page_size_changed(self, event):
        """Handle page size change"""
        try:
            new_size = int(self.page_size_var.get())
            if new_size != self.page_size:
                self.page_size = new_size
                
                # Recalculate total pages
                if self.filtered_items:
                    self.total_pages = math.ceil(len(self.filtered_items) / self.page_size)
                else:
                    self.total_pages = 1
                    
                # Ensure current page is valid
                if self.current_page > self.total_pages:
                    self.current_page = self.total_pages
                
                # Refresh view
                if self.current_view == "grid":
                    self.refresh_grid()
                else:
                    self.refresh_list()
        except ValueError:
            pass  # Invalid number format
    
    def _on_search(self, event=None):
        """Execute search"""
        query = self.search_var.get().strip()
        if query:
            # Add to search history if not already there
            if query not in self.search_history:
                self.search_history.append(query)
                # Keep only last 10 searches
                if len(self.search_history) > 10:
                    self.search_history = self.search_history[-10:]
            
            # Filter items
            self._filter_items(query)
        else:
            self._clear_search()
    
    def _clear_search(self):
        """Clear search"""
        self.search_var.set("")
        self.filtered_items = self.all_items
        
        # Recalculate pagination
        if self.filtered_items:
            self.total_pages = math.ceil(len(self.filtered_items) / self.page_size)
        else:
            self.total_pages = 1
            
        self.current_page = 1
        
        # Refresh view
        if self.current_view == "grid":
            self.refresh_grid()
        else:
            self.refresh_list()
    
    def _filter_items(self, query):
        """Filter items based on search query"""
        if not query:
            self.filtered_items = self.all_items
        else:
            # Simple case-insensitive search
            query = query.lower()
            
            # Check various fields for matches
            self.filtered_items = []
            for item in self.all_items:
                # Search in filename
                filename = item.get('filename', '').lower()
                
                # Search in title
                title = item.get('title', '').lower()
                
                # Search in metadata
                metadata = item.get('metadata', {})
                metadata_str = str(metadata).lower()
                
                # Check for match
                if (query in filename or query in title or query in metadata_str):
                    self.filtered_items.append(item)
        
        # Recalculate pagination
        if self.filtered_items:
            self.total_pages = math.ceil(len(self.filtered_items) / self.page_size)
        else:
            self.total_pages = 1
            
        self.current_page = 1
        
        # Refresh view
        if self.current_view == "grid":
            self.refresh_grid()
        else:
            self.refresh_list()
    
    def _show_search_history(self):
        """Show search history"""
        if not self.search_history:
            messagebox.showinfo("Search History", "No search history available")
            return
            
        # Create popup menu with history items
        history_menu = Menu(self, tearoff=0)
        
        # Add history items
        for query in reversed(self.search_history):
            history_menu.add_command(label=query, command=lambda q=query: self._use_history_item(q))
            
        # Add separator and clear option
        history_menu.add_separator()
        history_menu.add_command(label="Clear History", command=self._clear_search_history)
        
        # Show menu at cursor position
        try:
            history_menu.tk_popup(self.history_button.winfo_rootx(), 
                               self.history_button.winfo_rooty() + self.history_button.winfo_height())
        finally:
            history_menu.grab_release()
    
    def _clear_search_history(self):
        """Clear search history"""
        self.search_history = []
    
    def _use_history_item(self, query):
        """Use a history item for search"""
        self.search_var.set(query)
        self._on_search()
    
    def _on_search_text_changed(self, *args):
        """Handle search text change"""
        # Can be used for implementing search-as-you-type
        pass
    
    def _show_context_menu(self, card, event):
        """Show context menu for a card"""
        if self.context_menu_callback:
            self.context_menu_callback("context_menu", card.doc, event)
    
    def set_items(self, items):
        """Set items for display
        
        Args:
            items (list): List of document items
        """
        self.all_items = items
        self.filtered_items = items
        
        # Calculate total pages
        if items:
            self.total_pages = math.ceil(len(items) / self.page_size)
        else:
            self.total_pages = 1
            
        self.current_page = 1
        
        # Reset selection
        self.selected_docs = []
        
        # Refresh view
        if self.current_view == "grid":
            self.refresh_grid()
        else:
            self.refresh_list()
