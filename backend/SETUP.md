# Backend Setup Instructions

This guide will help you set up the FastAPI backend with Supabase authentication and Prisma ORM.

## Prerequisites

- Python 3.11 or higher
- PostgreSQL database
- Supabase account (free tier works)

## Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to be provisioned (takes ~2 minutes)
4. Go to **Settings** → **API** and copy:
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_KEY)
   - **service_role** key (SUPABASE_SERVICE_ROLE_KEY)
   - **JWT Secret** (SUPABASE_JWT_SECRET) - found in Settings → API → JWT Settings

## Step 2: Set Up Database

1. In Supabase dashboard, go to **Settings** → **Database**
2. Copy the **Connection string** (URI format)
   - It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
3. Or create a separate PostgreSQL database for testing:
   ```bash
   createdb dealflow_db
   ```

## Step 3: Install Python Dependencies

```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

## Step 4: Set Up Prisma

1. Install Prisma CLI (if not already installed):
   ```bash
   pip install prisma
   ```

2. Generate Prisma Client:
   ```bash
   cd backend
   prisma generate
   ```

3. Run migrations to create database tables:
   ```bash
   prisma db push
   ```
   
   Or create a migration:
   ```bash
   prisma migrate dev --name init
   ```

## Step 5: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your values:
   ```env
   # Database (use Supabase connection string or your local PostgreSQL)
   DATABASE_URL=postgresql://postgres:password@localhost:5432/dealflow_db
   
   # Supabase
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

## Step 6: Set Up Supabase Storage (for Contract Files)

1. In Supabase dashboard, go to **Storage**
2. Create a new bucket named `contracts`
3. Set it to **Public** (or Private with RLS policies)
4. Configure CORS if needed

## Step 7: Run the Server

```bash
# Make sure you're in the backend directory with venv activated
python -m app.main
```

Or using uvicorn directly:
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Step 8: Test the API

1. Open http://localhost:8000/docs
2. You'll see the Swagger UI with all endpoints
3. To test authenticated endpoints:
   - First, get a JWT token from Supabase (via frontend or Supabase client)
   - Click "Authorize" button in Swagger UI
   - Enter: `Bearer <your-jwt-token>`

## Troubleshooting

### Prisma Client Not Found
```bash
prisma generate
```

### Database Connection Error
- Check your DATABASE_URL is correct
- Ensure PostgreSQL is running
- Verify credentials

### Supabase Auth Not Working
- Verify SUPABASE_JWT_SECRET matches your Supabase project
- Check token format (should be `Bearer <token>`)
- Ensure Supabase project is active

### Import Errors
- Make sure you're in the `backend` directory
- Activate virtual environment
- Run `pip install -r requirements.txt` again

## Next Steps

Once the backend is running:
1. Test all endpoints using Swagger UI
2. Verify database tables are created
3. Test file uploads to Supabase Storage
4. Proceed with frontend migration

