#!/usr/bin/env python3
"""
MongoDB Visual Tool - Data Validator
"""
import os

class DataValidator:
    """Data Validator"""
    
    @staticmethod
    def validate_documents_with_files(docs, base_path=None):
        """Validate if file paths in documents exist
        
        Args:
            docs (list): List of documents
            base_path (str, optional): Base path
            
        Returns:
            tuple: (valid documents list, inconsistencies list)
        """
        valid_docs = []
        inconsistencies = []
        
        for doc in docs:
            # Copy document to avoid modifying original data
            doc_copy = dict(doc)
            
            # Check file path
            file_missing = False
            file_path = None
            
            # Extract file path
            if 'filePath' in doc:
                file_path = doc['filePath']
            elif 'imageUrl' in doc:
                file_path = doc['imageUrl']
                
            # Check if file exists
            if file_path:
                # If base path is provided, combine path with base path
                if base_path and not os.path.isabs(file_path):
                    full_path = os.path.join(base_path, file_path)
                else:
                    full_path = file_path
                    
                if not os.path.exists(full_path):
                    file_missing = True
                    inconsistencies.append({
                        'document_id': str(doc.get('_id')),
                        'issue': 'file_missing',
                        'path': full_path
                    })
            
            # Mark file missing
            if file_missing:
                doc_copy['_file_missing'] = True
                
            valid_docs.append(doc_copy)
            
        return valid_docs, inconsistencies 