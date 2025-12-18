# Frontend Setup Instructions

This guide will help you set up the Next.js frontend with Supabase authentication.

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase project (same one used for backend)
- FastAPI backend running on port 8000

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in your values:
   ```env
   # Supabase (same as backend)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   
   # FastAPI Backend
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

## Step 3: Move Components (if needed)

If components are still in `client/src/components`, you may need to copy them to the root `components/` directory. The structure should be:

```
components/
├── ui/              # shadcn/ui components
├── app-sidebar.tsx
├── deal-card.tsx
├── deal-form.tsx
├── kanban-column.tsx
├── contract-upload.tsx
├── payment-form.tsx
├── reminder-form.tsx
├── stat-card.tsx
├── theme-provider.tsx
├── theme-toggle.tsx
├── loading-state.tsx
└── empty-state.tsx
```

## Step 4: Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## Step 5: Test Authentication

1. Visit http://localhost:3000
2. Click "Sign In"
3. Create an account or sign in
4. You should be redirected to `/dashboard`

## API Endpoints

The frontend now calls FastAPI endpoints at:
- `/api/v1/deals`
- `/api/v1/payments`
- `/api/v1/contracts`
- `/api/v1/reminders`

Make sure your FastAPI backend is running on port 8000 (or update `NEXT_PUBLIC_API_URL`).

## Troubleshooting

### Components Not Found
- Make sure all components are in the `components/` directory
- Check import paths use `@/components/...`

### Authentication Not Working
- Verify Supabase environment variables are correct
- Check browser console for errors
- Ensure Supabase project is active

### API Calls Failing
- Verify FastAPI backend is running
- Check `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in FastAPI backend

### TypeScript Errors
- Run `npm run check` to see all errors
- Some types may need updating for Supabase

## Next Steps

1. Test all pages (Dashboard, Deals, Contracts, Reminders)
2. Verify API integration works
3. Test file uploads
4. Fix any remaining issues

