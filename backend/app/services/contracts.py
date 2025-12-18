from prisma import Prisma
from app.models.contract import ContractCreate, ContractUpdate
from typing import List, Optional
from prisma.models import Contract


class ContractService:
    @staticmethod
    async def get_contracts(db: Prisma, user_id: str) -> List[Contract]:
        """Get all contracts for deals belonging to a user."""
        # Get all user's deals first
        user_deals = await db.deal.find_many(
            where={"userId": user_id},
            select={"id": True}
        )
        deal_ids = [deal.id for deal in user_deals]
        
        if not deal_ids:
            return []
        
        # Get contracts for all user's deals
        # Note: Prisma Python "in" syntax may need adjustment
        # Alternative: Loop through deals and collect contracts
        all_contracts = []
        for deal_id in deal_ids:
            contracts = await db.contract.find_many(
                where={"dealId": deal_id},
                order=[{"createdAt": "desc"}]
            )
            all_contracts.extend(contracts)
        return sorted(all_contracts, key=lambda c: c.createdAt, reverse=True)
    
    @staticmethod
    async def get_contracts_by_deal(db: Prisma, deal_id: int) -> List[Contract]:
        """Get all contracts for a specific deal."""
        return await db.contract.find_many(
            where={"dealId": deal_id},
            order=[{"createdAt": "desc"}]
        )
    
    @staticmethod
    async def get_contract(db: Prisma, contract_id: int) -> Optional[Contract]:
        """Get a single contract by ID."""
        return await db.contract.find_unique(where={"id": contract_id})
    
    @staticmethod
    async def create_contract(db: Prisma, contract_data: ContractCreate) -> Contract:
        """Create a new contract."""
        contract_dict = contract_data.model_dump(by_alias=True, exclude_none=True)
        return await db.contract.create(data=contract_dict)
    
    @staticmethod
    async def update_contract(
        db: Prisma,
        contract_id: int,
        contract_data: ContractUpdate
    ) -> Optional[Contract]:
        """Update a contract."""
        update_dict = contract_data.model_dump(by_alias=True, exclude_none=True)
        return await db.contract.update(
            where={"id": contract_id},
            data=update_dict
        )
    
    @staticmethod
    async def delete_contract(db: Prisma, contract_id: int) -> bool:
        """Delete a contract."""
        contract = await db.contract.find_unique(where={"id": contract_id})
        if not contract:
            return False
        
        await db.contract.delete(where={"id": contract_id})
        return True

