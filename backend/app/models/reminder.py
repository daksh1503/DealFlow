from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class ReminderBase(BaseModel):
    deal_id: Optional[int] = Field(None, alias="dealId")
    type: str
    title: str = Field(..., min_length=1, max_length=255)
    remind_at: datetime = Field(..., alias="remindAt")
    
    @field_validator("type")
    @classmethod
    def validate_type(cls, v):
        allowed = ["follow_up", "content_delivery", "payment"]
        if v not in allowed:
            raise ValueError(f"Type must be one of: {', '.join(allowed)}")
        return v


class ReminderCreate(ReminderBase):
    pass


class ReminderUpdate(BaseModel):
    deal_id: Optional[int] = Field(None, alias="dealId")
    type: Optional[str] = None
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    remind_at: Optional[datetime] = Field(None, alias="remindAt")
    sent: Optional[bool] = None
    
    @field_validator("type")
    @classmethod
    def validate_type(cls, v):
        if v is not None:
            allowed = ["follow_up", "content_delivery", "payment"]
            if v not in allowed:
                raise ValueError(f"Type must be one of: {', '.join(allowed)}")
        return v


class ReminderResponse(BaseModel):
    id: int
    user_id: str = Field(alias="userId")
    deal_id: Optional[int] = Field(None, alias="dealId")
    type: str
    title: str
    remind_at: datetime = Field(alias="remindAt")
    sent: bool
    created_at: datetime = Field(alias="createdAt")
    
    class Config:
        from_attributes = True
        populate_by_name = True

