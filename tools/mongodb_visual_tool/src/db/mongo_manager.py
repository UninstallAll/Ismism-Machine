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
    
    def get_collection_schema(self, database, collection):
        """获取集合的实际字段结构
        
        通过采样分析集合中的文档来获取实际的字段结构
        
        Args:
            database (str): 数据库名
            collection (str): 集合名
            
        Returns:
            dict: 字段结构信息
        """
        if not self.client:
            raise ConnectionError("Not connected to MongoDB")
            
        try:
            # 获取集合中的一个样本文档
            sample_doc = self.client[database][collection].find_one()
            if not sample_doc:
                return {
                    "properties": {
                        "_id": {"bsonType": "objectId"},
                        "name": {"bsonType": "string"},
                        "description": {"bsonType": "string"},
                        "type": {"bsonType": "string"},
                        "tags": {"bsonType": "array"},
                        "created_at": {"bsonType": "date"},
                        "updated_at": {"bsonType": "date"}
                    }
                }
                
            # 分析文档结构
            properties = {}
            for field, value in sample_doc.items():
                if field == '_id':
                    properties[field] = {"bsonType": "objectId"}
                    continue
                    
                if isinstance(value, str):
                    properties[field] = {"bsonType": "string"}
                elif isinstance(value, int):
                    properties[field] = {"bsonType": "int"}
                elif isinstance(value, float):
                    properties[field] = {"bsonType": "double"}
                elif isinstance(value, bool):
                    properties[field] = {"bsonType": "bool"}
                elif isinstance(value, list):
                    properties[field] = {"bsonType": "array"}
                elif isinstance(value, dict):
                    properties[field] = {"bsonType": "object"}
                else:
                    properties[field] = {"bsonType": "string"}  # 默认类型
                    
            return {"properties": properties}
        except Exception as e:
            print(f"Failed to get collection schema: {e}")
            return {"properties": {}}

    def insert_many(self, database, collection, documents):
        """Insert multiple documents
        
        Args:
            database (str): Database name
            collection (str): Collection name
            documents (list): List of documents to insert
            
        Returns:
            bool: Returns True if insertion successful
        """
        if not self.client:
            raise ConnectionError("Not connected to MongoDB")
            
        try:
            # 获取集合的实际字段结构
            schema = self.get_collection_schema(database, collection)
            
            if schema:
                print(f"[DEBUG] Processing documents with schema: {schema}")
                processed_docs = []
                for doc in documents:
                    processed_doc = self._process_document_for_schema(doc, schema)
                    processed_docs.append(processed_doc)
                    print(f"[DEBUG] Original doc: {doc}")
                    print(f"[DEBUG] Processed doc: {processed_doc}")
                documents = processed_docs
            
            result = self.client[database][collection].insert_many(documents)
            return bool(result.inserted_ids)
        except Exception as e:
            print(f"Failed to insert documents: {e}")
            if hasattr(e, 'details'):
                print(f"Error details: {e.details}")
            return False
    
    def _process_document_for_schema(self, doc, schema):
        """处理文档以符合schema要求
        
        Args:
            doc (dict): 原始文档
            schema (dict): JSON Schema
        
        Returns:
            dict: 处理后的文档
        """
        processed = doc.copy()
        properties = schema.get('properties', {})
        
        for field, field_schema in properties.items():
            if field not in processed:
                continue
                
            # 处理字段类型可能是数组的情况
            field_types = field_schema.get('bsonType')
            if isinstance(field_types, list):
                field_types = [t for t in field_types if t != 'null']
                if field_types:
                    field_type = field_types[0]
                else:
                    continue
            else:
                field_type = field_types

            if field_type == 'objectId' and isinstance(processed[field], str):
                try:
                    processed[field] = ObjectId(processed[field])
                except Exception as e:
                    print(f"Failed to convert {field} to ObjectId: {e}")
            elif field_type == 'array':
                items_schema = field_schema.get('items', {})
                item_type = items_schema.get('bsonType')
                if item_type == 'objectId' and isinstance(processed[field], list):
                    try:
                        processed[field] = [ObjectId(item) if isinstance(item, str) else item 
                                         for item in processed[field]]
                    except Exception as e:
                        print(f"Failed to convert items in {field} to ObjectId: {e}")
        
        return processed

    def get_collection_info(self, database, collection):
        """Get collection information including validation rules
        
        Args:
            database (str): Database name
            collection (str): Collection name
            
        Returns:
            dict: Collection information
        """
        if not self.client:
            raise ConnectionError("Not connected to MongoDB")
            
        try:
            collections = list(self.client[database].list_collections(filter={'name': collection}))
            return collections[0] if collections else {}
        except Exception as e:
            print(f"Failed to get collection info: {e}")
            return {}
    
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
        """Delete document and handle related documents
        
        Args:
            database (str): Database name
            collection (str): Collection name
            document_id (str): Document ID
            
        Returns:
            bool: Returns True if deletion successful
        """
        if not self.client:
            raise ConnectionError("Not connected to MongoDB")
            
        try:
            # 转换document_id为ObjectId
            doc_id = ObjectId(document_id) if isinstance(document_id, str) else document_id
            
            # 获取要删除的文档
            doc = self.client[database][collection].find_one({'_id': doc_id})
            if not doc:
                print(f"Document not found: {document_id}")
                return False

            print(f"[DEBUG] Deleting document: {doc}")

            # 如果是艺术家文档，需要处理关联
            if collection == 'artists':
                # 从movements中移除该艺术家的引用
                if 'movements' in doc:
                    for movement_id in doc['movements']:
                        try:
                            print(f"[DEBUG] Removing artist from movement: {movement_id}")
                            self.client[database]['art_movements'].update_many(
                                {'_id': movement_id},
                                {'$pull': {'representative_artists': doc_id}}
                            )
                        except Exception as e:
                            print(f"Error updating movement {movement_id}: {e}")

                # 处理艺术家的作品
                if 'notable_works' in doc:
                    for work_id in doc['notable_works']:
                        try:
                            print(f"[DEBUG] Deleting artwork: {work_id}")
                            self.client[database]['artworks'].delete_one({'_id': work_id})
                        except Exception as e:
                            print(f"Error deleting artwork {work_id}: {e}")

            # 删除主文档
            print(f"[DEBUG] Deleting main document with id: {doc_id}")
            result = self.client[database][collection].delete_one({'_id': doc_id})
            success = result.deleted_count > 0
            print(f"[DEBUG] Deletion result: {success}")
            return success
            
        except Exception as e:
            print(f"Delete document error: {e}")
            if hasattr(e, 'details'):
                print(f"Error details: {e.details}")
            return False
    
    def close(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            self.client = None 