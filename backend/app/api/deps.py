from fastapi import Depends
from app.core.auth import get_current_user
from app.core.dependencies import get_db
from app.prisma_client import Prisma
from typing import Dict


def get_authenticated_user(
    user: Dict = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """
    Combined dependency that provides both authenticated user and database.
    Use this in routes that need both authentication and database access.
    """
    return {"user": user, "db": db}

