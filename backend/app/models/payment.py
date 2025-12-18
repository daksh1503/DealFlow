from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from decimal import Decimal


class PaymentBase(BaseModel):
    deal_id: int = Field(..., alias="dealId")
    amount: Decimal
    paid: bool = False
    payment_date: Optional[datetime] = Field(None, alias="paymentDate")
    mode: Optional[str] = Field(None, max_length=100)
    
    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v):
        if isinstance(v, str):
            import re
            if not re.match(r'^\d+(\.\d{1,2})?$', v):
                raise ValueError("Invalid amount format")
            return Decimal(v)
        return v


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    amount: Optional[Decimal] = None
    paid: Optional[bool] = None
    payment_date: Optional[datetime] = Field(None, alias="paymentDate")
    mode: Optional[str] = Field(None, max_length=100)
    
    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v):
        if v is not None and isinstance(v, str):
            import re
            if not re.match(r'^\d+(\.\d{1,2})?$', v):
                raise ValueError("Invalid amount format")
            return Decimal(v)
        return v


class PaymentResponse(BaseModel):
    id: int
    deal_id: int = Field(alias="dealId")
    amount: Decimal
    paid: bool
    payment_date: Optional[datetime] = Field(None, alias="paymentDate")
    mode: Optional[str] = None
    created_at: datetime = Field(alias="createdAt")
    
    class Config:
        from_attributes = True
        populate_by_name = True

