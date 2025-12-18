from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_authenticated_user
from app.models.reminder import ReminderCreate, ReminderUpdate, ReminderResponse
from app.services.reminders import ReminderService
from app.services.deals import DealService
from typing import List

router = APIRouter()


@router.get("/reminders", response_model=List[ReminderResponse])
async def get_reminders(deps: dict = Depends(get_authenticated_user)):
    """Get all reminders for the current user."""
    user_id = deps["user"]["user_id"]
    db = deps["db"]
    
    reminders = await ReminderService.get_reminders(db, user_id)
    return reminders


@router.post("/reminders", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
async def create_reminder(
    reminder_data: ReminderCreate,
    deps: dict = Depends(get_authenticated_user)
):
    """Create a new reminder."""
    user_id = deps["user"]["user_id"]
    db = deps["db"]
    
    # If dealId is provided, verify it belongs to user
    if reminder_data.deal_id:
        deal = await DealService.get_deal(db, reminder_data.deal_id, user_id)
        if not deal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deal not found"
            )
    
    reminder = await ReminderService.create_reminder(db, user_id, reminder_data)
    return reminder


@router.patch("/reminders/{reminder_id}", response_model=ReminderResponse)
async def update_reminder(
    reminder_id: int,
    reminder_data: ReminderUpdate,
    deps: dict = Depends(get_authenticated_user)
):
    """Update a reminder."""
    user_id = deps["user"]["user_id"]
    db = deps["db"]
    
    reminder = await ReminderService.update_reminder(db, reminder_id, user_id, reminder_data)
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )
    
    return reminder


@router.delete("/reminders/{reminder_id}")
async def delete_reminder(
    reminder_id: int,
    deps: dict = Depends(get_authenticated_user)
):
    """Delete a reminder."""
    user_id = deps["user"]["user_id"]
    db = deps["db"]
    
    deleted = await ReminderService.delete_reminder(db, reminder_id, user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )
    
    return {"message": "Reminder deleted successfully"}

