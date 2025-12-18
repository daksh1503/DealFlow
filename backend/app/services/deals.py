from prisma import Prisma
from app.models.deal import DealCreate, DealUpdate
from typing import List, Optional
from prisma.models import Deal


class DealService:
    @staticmethod
    async def get_deals(db: Prisma, user_id: str) -> List[Deal]:
        """Get all deals for a user."""
        return await db.deal.find_many(
            where={"userId": user_id},
            order=[{"createdAt": "desc"}]
        )
    
    @staticmethod
    async def get_deal(db: Prisma, deal_id: int, user_id: str) -> Optional[Deal]:
        """Get a single deal by ID, ensuring it belongs to the user."""
        return await db.deal.find_first(
            where={
                "id": deal_id,
                "userId": user_id
            }
        )
    
    @staticmethod
    async def create_deal(db: Prisma, user_id: str, deal_data: DealCreate) -> Deal:
        """Create a new deal."""
        # Convert Pydantic model to Prisma dict
        deal_dict = deal_data.model_dump(by_alias=True, exclude_none=True)
        deal_dict["userId"] = user_id
        
        # Convert status and platform to enum values
        from prisma.enums import DealStatus, Platform
        deal_dict["status"] = DealStatus(deal_dict["status"])
        deal_dict["platform"] = Platform(deal_dict["platform"])
        
        return await db.deal.create(data=deal_dict)
    
    @staticmethod
    async def update_deal(
        db: Prisma,
        deal_id: int,
        user_id: str,
        deal_data: DealUpdate
    ) -> Optional[Deal]:
        """Update a deal, ensuring it belongs to the user."""
        # Check if deal exists and belongs to user
        existing = await DealService.get_deal(db, deal_id, user_id)
        if not existing:
            return None
        
        # Convert update data
        update_dict = deal_data.model_dump(by_alias=True, exclude_none=True)
        
        # Convert enums if present
        if "status" in update_dict:
            from prisma.enums import DealStatus
            update_dict["status"] = DealStatus(update_dict["status"])
        if "platform" in update_dict:
            from prisma.enums import Platform
            update_dict["platform"] = Platform(update_dict["platform"])
        
        return await db.deal.update(
            where={"id": deal_id},
            data=update_dict
        )
    
    @staticmethod
    async def delete_deal(db: Prisma, deal_id: int, user_id: str) -> bool:
        """Delete a deal, ensuring it belongs to the user."""
        existing = await DealService.get_deal(db, deal_id, user_id)
        if not existing:
            return False
        
        await db.deal.delete(where={"id": deal_id})
        return True

