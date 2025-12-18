from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from app.api.deps import get_authenticated_user
from app.models.contract import ContractCreate, ContractResponse
from app.services.contracts import ContractService
from app.services.deals import DealService
from app.services.storage import storage_service
from typing import List, Optional
from datetime import datetime

router = APIRouter()


@router.get("/contracts", response_model=List[ContractResponse])
async def get_contracts(deps: dict = Depends(get_authenticated_user)):
    """Get all contracts for the current user."""
    user_id = deps["user"]["user_id"]
    db = deps["db"]
    
    contracts = await ContractService.get_contracts(db, user_id)
    return contracts


@router.post("/contracts", response_model=ContractResponse, status_code=status.HTTP_201_CREATED)
async def upload_contract(
    file: UploadFile = File(...),
    deal_id: int = Form(...),
    usage_end_date: Optional[str] = Form(None),
    exclusivity_end_date: Optional[str] = Form(None),
    deps: dict = Depends(get_authenticated_user)
):
    """Upload a new contract file."""
    user_id = deps["user"]["user_id"]
    db = deps["db"]
    
    # Verify deal belongs to user
    deal = await DealService.get_deal(db, deal_id, user_id)
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )
    
    # Upload file to Supabase Storage
    try:
        file_url = await storage_service.upload_file(file, deal_id, user_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Parse optional dates
    usage_end = datetime.fromisoformat(usage_end_date) if usage_end_date else None
    exclusivity_end = datetime.fromisoformat(exclusivity_end_date) if exclusivity_end_date else None
    
    # Create contract record
    contract_data = ContractCreate(
        dealId=deal_id,
        fileUrl=file_url,
        fileName=file.filename,
        usageEndDate=usage_end,
        exclusivityEndDate=exclusivity_end
    )
    
    contract = await ContractService.create_contract(db, contract_data)
    return contract


@router.delete("/contracts/{contract_id}")
async def delete_contract(
    contract_id: int,
    deps: dict = Depends(get_authenticated_user)
):
    """Delete a contract and its file."""
    user_id = deps["user"]["user_id"]
    db = deps["db"]
    
    # Get existing contract to verify ownership
    existing = await ContractService.get_contract(db, contract_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )
    
    # Verify the deal belongs to the user
    deal = await DealService.get_deal(db, existing.dealId, user_id)
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized"
        )
    
    # Delete file from Supabase Storage
    await storage_service.delete_file(existing.fileUrl)
    
    # Delete contract record
    deleted = await ContractService.delete_contract(db, contract_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )
    
    return {"message": "Contract deleted successfully"}

