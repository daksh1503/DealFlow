from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from decimal import Decimal


class DealBase(BaseModel):
    brand_name: str = Field(..., min_length=1, max_length=255, alias="brandName")
    platform: str
    deal_value: Decimal = Field(..., alias="dealValue")
    status: str = "lead"
    deadline: Optional[datetime] = None
    notes: Optional[str] = None


class DealCreate(DealBase):
    @field_validator("platform")
    @classmethod
    def validate_platform(cls, v):
        allowed = ["instagram", "youtube", "tiktok", "twitter", "linkedin", "other"]
        if v not in allowed:
            raise ValueError(f"Platform must be one of: {', '.join(allowed)}")
        return v
    
    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        allowed = ["lead", "negotiation", "signed", "content_delivered", "paid"]
        if v not in allowed:
            raise ValueError(f"Status must be one of: {', '.join(allowed)}")
        return v
    
    @field_validator("deal_value")
    @classmethod
    def validate_deal_value(cls, v):
        if isinstance(v, str):
            # Validate format: digits with optional decimal
            import re
            if not re.match(r'^\d+(\.\d{1,2})?$', v):
                raise ValueError("Invalid amount format")
            return Decimal(v)
        return v


class DealUpdate(BaseModel):
    brand_name: Optional[str] = Field(None, min_length=1, max_length=255, alias="brandName")
    platform: Optional[str] = None
    deal_value: Optional[Decimal] = Field(None, alias="dealValue")
    status: Optional[str] = None
    deadline: Optional[datetime] = None
    notes: Optional[str] = None
    
    @field_validator("platform")
    @classmethod
    def validate_platform(cls, v):
        if v is not None:
            allowed = ["instagram", "youtube", "tiktok", "twitter", "linkedin", "other"]
            if v not in allowed:
                raise ValueError(f"Platform must be one of: {', '.join(allowed)}")
        return v
    
    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v is not None:
            allowed = ["lead", "negotiation", "signed", "content_delivered", "paid"]
            if v not in allowed:
                raise ValueError(f"Status must be one of: {', '.join(allowed)}")
        return v


class DealResponse(BaseModel):
    id: int
    user_id: str = Field(alias="userId")
    brand_name: str = Field(alias="brandName")
    platform: str
    deal_value: Decimal = Field(alias="dealValue")
    status: str
    deadline: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime = Field(alias="createdAt")
    
    class Config:
        from_attributes = True
        populate_by_name = True

