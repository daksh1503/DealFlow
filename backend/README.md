# DealFlow Backend API

FastAPI backend for Brand Deal CRM application.

## Tech Stack

- **FastAPI** - Modern Python web framework
- **Prisma** - Type-safe ORM
- **Supabase** - Authentication & Storage
- **PostgreSQL** - Database
- **Pydantic** - Data validation

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── core/                # Configuration & auth
│   ├── api/                 # API routes
│   ├── models/              # Pydantic models
│   ├── services/            # Business logic
│   └── prisma_client/       # Generated Prisma client
├── prisma/
│   └── schema.prisma        # Database schema
├── requirements.txt          # Python dependencies
└── .env                     # Environment variables
```

## API Endpoints

All endpoints are prefixed with `/api/v1`

### Deals
- `GET /api/v1/deals` - Get all deals
- `GET /api/v1/deals/{id}` - Get single deal
- `POST /api/v1/deals` - Create deal
- `PATCH /api/v1/deals/{id}` - Update deal
- `DELETE /api/v1/deals/{id}` - Delete deal

### Payments
- `GET /api/v1/payments` - Get all payments
- `GET /api/v1/payments/{id}` - Get single payment
- `POST /api/v1/payments` - Create payment
- `PATCH /api/v1/payments/{id}` - Update payment
- `DELETE /api/v1/payments/{id}` - Delete payment

### Contracts
- `GET /api/v1/contracts` - Get all contracts
- `POST /api/v1/contracts` - Upload contract
- `DELETE /api/v1/contracts/{id}` - Delete contract

### Reminders
- `GET /api/v1/reminders` - Get all reminders
- `POST /api/v1/reminders` - Create reminder
- `PATCH /api/v1/reminders/{id}` - Update reminder
- `DELETE /api/v1/reminders/{id}` - Delete reminder

## Authentication

All endpoints (except `/health` and `/`) require authentication via Supabase JWT tokens.

Include token in request header:
```
Authorization: Bearer <supabase-jwt-token>
```

## Development

```bash
# Install dependencies
pip install -r requirements.txt

# Generate Prisma client
prisma generate

# Run migrations
prisma db push

# Start server
uvicorn app.main:app --reload
```

## Environment Variables

See `.env.example` for required variables.

## Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

