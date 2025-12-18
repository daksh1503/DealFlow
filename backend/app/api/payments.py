from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.api.deps import get_authenticated_user
from app.models.payment import PaymentCreate, PaymentUpdate, PaymentResponse
from app.services.payments import PaymentService
from app.services.deals import DealService
from typing import List, Optional

router = APIRouter()


@router.get("/payments", response_model=List[PaymentResponse])
async def get_payments(
    deal_id: Optional[int] = Query(None, alias="dealId"),
    deps: dict = Depends(get_authenticated_user)
):
    """Get all payments for the current user, optionally filtered by deal."""
    user_id = deps["user"]["user_id"]
    db = deps["db"]
    
    if deal_id:
        # Verify deal belongs to user
        deal = await DealService.get_deal(db, deal_id, user_id)
        if not deal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deal not found"
            )
        payments = await PaymentService.get_payments_by_deal(db, deal_id)
    else:
        payments = await PaymentService.get_payments(db, user_id)
    
    return payments


@router.get("/payments/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    deps: dict = Depends(get_authenticated_user)
):
    """Get a single payment by ID."""
    user_id = deps["user"]["user_id"]
    db = deps["db"]
    
    payment = await PaymentService.get_payment(db, payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Verify the deal belongs to the user
    deal = await DealService.get_deal(db, payment.dealId, user_id)
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized"
        )
    
    return payment


@router.post("/payments", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment_data: PaymentCreate,
    deps: dict = Depends(get_authenticated_user)
):
    """Create a new payment."""
    user_id = deps["user"]["user_id"]
    db = deps["db"]
    
    # Verify deal belongs to user
    deal = await DealService.get_deal(db, payment_data.deal_id, user_id)
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )
    
    payment = await PaymentService.create_payment(db, payment_data)
    return payment


@router.patch("/payments/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: int,
    payment_data: PaymentUpdate,
    deps: dict = Depends(get_authenticated_user)
):
    """Update a payment."""
    user_id = deps["user"]["user_id"]
    db = deps["db"]
    
    # Get existing payment to verify ownership
    existing = await PaymentService.get_payment(db, payment_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Verify the deal belongs to the user
    deal = await DealService.get_deal(db, existing.dealId, user_id)
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized"
        )
    
    payment = await PaymentService.update_payment(db, payment_id, payment_data)
    return payment


@router.delete("/payments/{payment_id}")
async def delete_payment(
    payment_id: int,
    deps: dict = Depends(get_authenticated_user)
):
    """Delete a payment."""
    user_id = deps["user"]["user_id"]
    db = deps["db"]
    
    # Get existing payment to verify ownership
    existing = await PaymentService.get_payment(db, payment_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Verify the deal belongs to the user
    deal = await DealService.get_deal(db, existing.dealId, user_id)
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized"
        )
    
    deleted = await PaymentService.delete_payment(db, payment_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return {"message": "Payment deleted successfully"}

