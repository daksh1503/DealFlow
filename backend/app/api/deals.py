from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_authenticated_user
from app.models.deal import DealCreate, DealUpdate, DealResponse
from app.services.deals import DealService
from typing import List

router = APIRouter()


@router.get("/deals", response_model=List[DealResponse])
async def get_deals(deps: dict = Depends(get_authenticated_user)):
    """Get all deals for the current user."""
    user_id = deps["user"]["user_id"]
    db = deps["db"]
    
    deals = await DealService.get_deals(db, user_id)
    return deals


@router.get("/deals/{deal_id}", response_model=DealResponse)
async def get_deal(
    deal_id: int,
    deps: dict = Depends(get_authenticated_user)
):
    """Get a single deal by ID."""
    user_id = deps["user"]["user_id"]
    db = deps["db"]
    
    deal = await DealService.get_deal(db, deal_id, user_id)
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )
    
    return deal


@router.post("/deals", response_model=DealResponse, status_code=status.HTTP_201_CREATED)
async def create_deal(
    deal_data: DealCreate,
    deps: dict = Depends(get_authenticated_user)
):
    """Create a new deal."""
    user_id = deps["user"]["user_id"]
    db = deps["db"]
    
    deal = await DealService.create_deal(db, user_id, deal_data)
    return deal


@router.patch("/deals/{deal_id}", response_model=DealResponse)
async def update_deal(
    deal_id: int,
    deal_data: DealUpdate,
    deps: dict = Depends(get_authenticated_user)
):
    """Update a deal."""
    user_id = deps["user"]["user_id"]
    db = deps["db"]
    
    deal = await DealService.update_deal(db, deal_id, user_id, deal_data)
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )
    
    return deal


@router.delete("/deals/{deal_id}")
async def delete_deal(
    deal_id: int,
    deps: dict = Depends(get_authenticated_user)
):
    """Delete a deal."""
    user_id = deps["user"]["user_id"]
    db = deps["db"]
    
    deleted = await DealService.delete_deal(db, deal_id, user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )
    
    return {"message": "Deal deleted successfully"}

