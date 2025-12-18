from prisma import Prisma
from app.models.payment import PaymentCreate, PaymentUpdate
from typing import List, Optional
from prisma.models import Payment


class PaymentService:
    @staticmethod
    async def get_payments(db: Prisma, user_id: str) -> List[Payment]:
        """Get all payments for deals belonging to a user."""
        # Get all user's deals first
        user_deals = await db.deal.find_many(
            where={"userId": user_id},
            select={"id": True}
        )
        deal_ids = [deal.id for deal in user_deals]
        
        if not deal_ids:
            return []
        
        # Get payments for all user's deals
        # Note: Prisma Python "in" syntax may need adjustment
        # Alternative: Loop through deals and collect payments
        all_payments = []
        for deal_id in deal_ids:
            payments = await db.payment.find_many(
                where={"dealId": deal_id},
                order=[{"createdAt": "desc"}]
            )
            all_payments.extend(payments)
        return sorted(all_payments, key=lambda p: p.createdAt, reverse=True)
    
    @staticmethod
    async def get_payments_by_deal(db: Prisma, deal_id: int) -> List[Payment]:
        """Get all payments for a specific deal."""
        return await db.payment.find_many(
            where={"dealId": deal_id},
            order=[{"createdAt": "desc"}]
        )
    
    @staticmethod
    async def get_payment(db: Prisma, payment_id: int) -> Optional[Payment]:
        """Get a single payment by ID."""
        return await db.payment.find_unique(where={"id": payment_id})
    
    @staticmethod
    async def create_payment(db: Prisma, payment_data: PaymentCreate) -> Payment:
        """Create a new payment."""
        payment_dict = payment_data.model_dump(by_alias=True, exclude_none=True)
        return await db.payment.create(data=payment_dict)
    
    @staticmethod
    async def update_payment(
        db: Prisma,
        payment_id: int,
        payment_data: PaymentUpdate
    ) -> Optional[Payment]:
        """Update a payment."""
        update_dict = payment_data.model_dump(by_alias=True, exclude_none=True)
        return await db.payment.update(
            where={"id": payment_id},
            data=update_dict
        )
    
    @staticmethod
    async def delete_payment(db: Prisma, payment_id: int) -> bool:
        """Delete a payment."""
        payment = await db.payment.find_unique(where={"id": payment_id})
        if not payment:
            return False
        
        await db.payment.delete(where={"id": payment_id})
        return True

