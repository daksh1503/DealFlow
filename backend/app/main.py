from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import deals, payments, contracts, reminders

app = FastAPI(
    title="DealFlow API",
    description="Brand Deal CRM API for Creators",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(deals.router, prefix="/api/v1", tags=["deals"])
app.include_router(payments.router, prefix="/api/v1", tags=["payments"])
app.include_router(contracts.router, prefix="/api/v1", tags=["contracts"])
app.include_router(reminders.router, prefix="/api/v1", tags=["reminders"])


@app.get("/")
async def root():
    return {
        "message": "DealFlow API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )

