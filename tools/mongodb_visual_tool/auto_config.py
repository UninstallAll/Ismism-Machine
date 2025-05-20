"""
Configuration file for MongoDB Visual Management Tool
"""

# MongoDB connection settings
DEFAULT_MONGODB_URI = 'mongodb://localhost:27017'

# Auto-connect on startup
AUTO_CONNECT = True

# Default database name
DEFAULT_DATABASE = 'ismism_machine'

# Image-related settings
IMAGE_PATH = '../public/images'

# UI settings
DEFAULT_GRID_COLUMNS = 3
DEFAULT_PAGE_SIZE = 12
WINDOW_SIZE = "1200x800"

# Relationship type definitions
RELATIONSHIP_TYPES = [
    "Created",       # Artist created artwork
    "BelongsTo",     # Artwork belongs to art movement
    "Influenced",    # Artist/movement influenced others
    "Contains",      # Collection contains elements
    "InheritedFrom", # Style inheritance
    "CollaboratedWith" # Collaboration between artists
] 