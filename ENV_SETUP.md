# Environment Variables Setup

## Backend Environment Variables

Create `backend/.env` file:

```bash
cd backend
cp env.example .env
```

Then edit `backend/.env` with your actual values:

```env
# Database (use Supabase connection string or your local PostgreSQL)
DATABASE_URL=postgresql://postgres:password@localhost:5432/dealflow_db

# Supabase (get from Supabase dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Server
PORT=8000
ENVIRONMENT=development

# CORS
FRONTEND_URL=http://localhost:3000
```

### How to Get Supabase Values:

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project (or create one)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
5. Go to **Settings** → **API** → **JWT Settings**
6. Copy **JWT Secret** → `SUPABASE_JWT_SECRET`

---

## Frontend Environment Variables

Create `frontend/.env.local` file:

```bash
cd frontend
cp env.example .env.local
```

Then edit `frontend/.env.local` with your actual values:

```env
# Supabase (same project as backend)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# FastAPI Backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### How to Get Supabase Values:

Same as backend - use the same **Project URL** and **anon public** key from Supabase dashboard.

---

## Quick Setup Checklist

### Backend:
- [ ] Create `backend/.env` from `backend/env.example`
- [ ] Fill in Supabase credentials
- [ ] Fill in database URL
- [ ] Set `PORT=8000`
- [ ] Set `FRONTEND_URL=http://localhost:3000`

### Frontend:
- [ ] Create `frontend/.env.local` from `frontend/env.example`
- [ ] Fill in Supabase credentials (same as backend)
- [ ] Set `NEXT_PUBLIC_API_URL=http://localhost:8000`

---

## Important Notes

1. **Never commit `.env` or `.env.local` files** - they contain secrets
2. **Use the same Supabase project** for both frontend and backend
3. **Database URL** can be:
   - Supabase connection string (recommended)
   - Local PostgreSQL database
4. **API URL** should match where your FastAPI backend runs

---

## Testing

After setting up environment variables:

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
prisma generate
prisma db push
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Both should start without errors if environment variables are correct!

