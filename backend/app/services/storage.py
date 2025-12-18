from supabase import create_client, Client
from app.core.config import settings
from fastapi import UploadFile
import uuid
from typing import Optional


class SupabaseStorageService:
    def __init__(self):
        self.client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        self.bucket_name = "contracts"
    
    async def upload_file(
        self,
        file: UploadFile,
        deal_id: int,
        user_id: str
    ) -> str:
        """
        Upload a file to Supabase Storage and return the public URL.
        
        Args:
            file: FastAPI UploadFile object
            deal_id: ID of the deal this contract belongs to
            user_id: ID of the user (for organization)
        
        Returns:
            Public URL of the uploaded file
        """
        # Generate unique filename
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "pdf"
        unique_filename = f"{user_id}/{deal_id}/{uuid.uuid4()}.{file_extension}"
        
        # Read file content
        file_content = await file.read()
        
        # Validate file type (only PDFs)
        if file.content_type != "application/pdf":
            raise ValueError("Only PDF files are allowed")
        
        # Validate file size (10MB limit)
        if len(file_content) > 10 * 1024 * 1024:
            raise ValueError("File size exceeds 10MB limit")
        
        # Upload to Supabase Storage
        response = self.client.storage.from_(self.bucket_name).upload(
            path=unique_filename,
            file=file_content,
            file_options={"content-type": "application/pdf"}
        )
        
        # Get public URL
        public_url = self.client.storage.from_(self.bucket_name).get_public_url(
            unique_filename
        )
        
        return public_url
    
    async def delete_file(self, file_url: str) -> bool:
        """
        Delete a file from Supabase Storage.
        
        Args:
            file_url: Public URL of the file to delete
        
        Returns:
            True if deleted successfully
        """
        try:
            # Extract file path from URL
            # URL format: https://[project].supabase.co/storage/v1/object/public/contracts/[path]
            path = file_url.split("/contracts/")[-1] if "/contracts/" in file_url else file_url
            
            # Delete from storage
            self.client.storage.from_(self.bucket_name).remove([path])
            return True
        except Exception:
            return False


# Global instance
storage_service = SupabaseStorageService()

