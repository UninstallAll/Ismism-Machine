#!/usr/bin/env python3
"""
MongoDB Visual Tool - MongoDB Manager
"""
import pymongo
from bson.objectid import ObjectId

class MongoDBManager:
    """MongoDB Database Manager"""
    
    def __init__(self, uri="mongodb://localhost:27017/"):
        """Initialize MongoDB Manager
        
        Args:
            uri (str): MongoDB connection URI
        """
        self.uri = uri
        self.client = None
    
    def connect(self):
        """Connect to MongoDB server
        
        Returns:
            bool: Returns True if connection successful, otherwise raises exception
        """
        try:
            self.client = pymongo.MongoClient(self.uri)
            # Verify connection
            self.client.admin.command('ping')
            return True
        except Exception as e:
            raise ConnectionError(f"Could not connect to MongoDB: {str(e)}")
    
    def list_databases(self):
        """Get database list
        
        Returns:
            list: List of database names
        """
        if not self.client:
            raise ConnectionError("Not connected to MongoDB")
            
        return sorted([db for db in self.client.list_database_names() 
                      if db not in ['admin', 'local', 'config']])
    
    def list_collections(self, database):
        """Get collection list
        
        Args:
            database (str): Database name
            
        Returns:
            list: List of collection names
        """
        if not self.client:
            raise ConnectionError("Not connected to MongoDB")
            
        return sorted(self.client[database].list_collection_names())
    
    def get_documents(self, database, collection, limit=100, skip=0, query=None):
        """Get documents
        
        Args:
            database (str): Database name
            collection (str): Collection name
            limit (int): Maximum number of documents to return
            skip (int): Number of documents to skip
            query (dict): Query conditions
            
        Returns:
            list: List of documents
        """
        if not self.client:
            raise ConnectionError("Not connected to MongoDB")
            
        query = query or {}
        return list(self.client[database][collection].find(query).limit(limit).skip(skip))
    
    def count_documents(self, database, collection, query=None):
        """Count documents
        
        Args:
            database (str): Database name
            collection (str): Collection name
            query (dict): Query conditions
            
        Returns:
            int: Document count
        """
        if not self.client:
            raise ConnectionError("Not connected to MongoDB")
            
        query = query or {}
        return self.client[database][collection].count_documents(query)
    
    def insert_document(self, database, collection, document):
        """Insert document
        
        Args:
            database (str): Database name
            collection (str): Collection name
            document (dict): Document to insert
            
        Returns:
            str: ID of inserted document
        """
        if not self.client:
            raise ConnectionError("Not connected to MongoDB")
            
        result = self.client[database][collection].insert_one(document)
        return str(result.inserted_id)
    
    def update_document(self, database, collection, document_id, update_data):
        """Update document
        
        Args:
            database (str): Database name
            collection (str): Collection name
            document_id (str): Document ID
            update_data (dict): Update data
            
        Returns:
            bool: Returns True if update successful
        """
        if not self.client:
            raise ConnectionError("Not connected to MongoDB")
            
        result = self.client[database][collection].update_one(
            {'_id': ObjectId(document_id)},
            {'$set': update_data}
        )
        return result.modified_count > 0
    
    def delete_document(self, database, collection, document_id):
        """Delete document
        
        Args:
            database (str): Database name
            collection (str): Collection name
            document_id (str): Document ID
            
        Returns:
            bool: Returns True if deletion successful
        """
        if not self.client:
            raise ConnectionError("Not connected to MongoDB")
            
        result = self.client[database][collection].delete_one({'_id': ObjectId(document_id)})
        return result.deleted_count > 0
    
    def close(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            self.client = None 