# DealFlow Frontend

Next.js frontend application for DealFlow - Brand Deal CRM.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
frontend/
├── app/              # Next.js App Router pages
│   ├── (auth)/      # Protected routes
│   ├── login/       # Login page
│   └── page.tsx     # Landing page
├── components/      # React components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and API client
└── middleware.ts    # Next.js middleware for auth
```

## Environment Variables

See `.env.local.example` for required variables.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run check` - Type check with TypeScript

