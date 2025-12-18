from prisma import Prisma
from app.models.reminder import ReminderCreate, ReminderUpdate
from typing import List, Optional
from prisma.models import Reminder


class ReminderService:
    @staticmethod
    async def get_reminders(db: Prisma, user_id: str) -> List[Reminder]:
        """Get all reminders for a user."""
        return await db.reminder.find_many(
            where={"userId": user_id},
            order=[{"remindAt": "desc"}]
        )
    
    @staticmethod
    async def get_reminder(
        db: Prisma,
        reminder_id: int,
        user_id: str
    ) -> Optional[Reminder]:
        """Get a single reminder by ID, ensuring it belongs to the user."""
        return await db.reminder.find_first(
            where={
                "id": reminder_id,
                "userId": user_id
            }
        )
    
    @staticmethod
    async def create_reminder(
        db: Prisma,
        user_id: str,
        reminder_data: ReminderCreate
    ) -> Reminder:
        """Create a new reminder."""
        reminder_dict = reminder_data.model_dump(by_alias=True, exclude_none=True)
        reminder_dict["userId"] = user_id
        
        # Convert type to enum
        from prisma.enums import ReminderType
        reminder_dict["type"] = ReminderType(reminder_dict["type"])
        
        return await db.reminder.create(data=reminder_dict)
    
    @staticmethod
    async def update_reminder(
        db: Prisma,
        reminder_id: int,
        user_id: str,
        reminder_data: ReminderUpdate
    ) -> Optional[Reminder]:
        """Update a reminder, ensuring it belongs to the user."""
        # Check if reminder exists and belongs to user
        existing = await ReminderService.get_reminder(db, reminder_id, user_id)
        if not existing:
            return None
        
        # Convert update data
        update_dict = reminder_data.model_dump(by_alias=True, exclude_none=True)
        
        # Convert enum if present
        if "type" in update_dict:
            from prisma.enums import ReminderType
            update_dict["type"] = ReminderType(update_dict["type"])
        
        return await db.reminder.update(
            where={"id": reminder_id},
            data=update_dict
        )
    
    @staticmethod
    async def delete_reminder(db: Prisma, reminder_id: int, user_id: str) -> bool:
        """Delete a reminder, ensuring it belongs to the user."""
        existing = await ReminderService.get_reminder(db, reminder_id, user_id)
        if not existing:
            return False
        
        await db.reminder.delete(where={"id": reminder_id})
        return True

