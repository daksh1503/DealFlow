from prisma import Prisma
from typing import Generator


def get_db() -> Generator:
    """
    Database dependency for FastAPI routes.
    Yields Prisma client instance.
    """
    db = Prisma()
    try:
        db.connect()
        yield db
    finally:
        db.disconnect()

