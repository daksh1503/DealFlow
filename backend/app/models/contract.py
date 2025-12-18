from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class ContractBase(BaseModel):
    deal_id: int = Field(..., alias="dealId")
    file_url: str = Field(..., alias="fileUrl")
    file_name: Optional[str] = Field(None, max_length=255, alias="fileName")
    usage_end_date: Optional[datetime] = Field(None, alias="usageEndDate")
    exclusivity_end_date: Optional[datetime] = Field(None, alias="exclusivityEndDate")
    
    @field_validator("file_url")
    @classmethod
    def validate_file_url(cls, v):
        # Basic URL validation
        if not v.startswith(("http://", "https://", "/")):
            raise ValueError("Invalid file URL")
        return v


class ContractCreate(ContractBase):
    pass


class ContractUpdate(BaseModel):
    file_url: Optional[str] = Field(None, alias="fileUrl")
    file_name: Optional[str] = Field(None, max_length=255, alias="fileName")
    usage_end_date: Optional[datetime] = Field(None, alias="usageEndDate")
    exclusivity_end_date: Optional[datetime] = Field(None, alias="exclusivityEndDate")


class ContractResponse(BaseModel):
    id: int
    deal_id: int = Field(alias="dealId")
    file_url: str = Field(alias="fileUrl")
    file_name: Optional[str] = Field(None, alias="fileName")
    usage_end_date: Optional[datetime] = Field(None, alias="usageEndDate")
    exclusivity_end_date: Optional[datetime] = Field(None, alias="exclusivityEndDate")
    created_at: datetime = Field(alias="createdAt")
    
    class Config:
        from_attributes = True
        populate_by_name = True

