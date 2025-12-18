# Frontend Reorganization Plan

Moving all Next.js frontend files into a `frontend/` folder for better organization.

## Current Structure
```
Backend-Frontend/
├── app/              # Next.js app (should be in frontend/)
├── components/       # Components (should be in frontend/)
├── hooks/            # Hooks (should be in frontend/)
├── lib/              # Utilities (should be in frontend/)
├── middleware.ts     # Next.js middleware (should be in frontend/)
├── next.config.js    # Next.js config (should be in frontend/)
├── package.json      # Frontend deps (should be in frontend/)
└── backend/          # Backend (already organized)
```

## Target Structure
```
Backend-Frontend/
├── frontend/         # Next.js frontend
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── middleware.ts
│   ├── next.config.js
│   ├── package.json
│   └── ...
├── backend/          # FastAPI backend
└── shared/           # Shared types (if needed)
```

## Files to Move
- `app/` → `frontend/app/`
- `components/` → `frontend/components/`
- `hooks/` → `frontend/hooks/`
- `lib/` → `frontend/lib/`
- `middleware.ts` → `frontend/middleware.ts`
- `next.config.js` → `frontend/next.config.js`
- `next-env.d.ts` → `frontend/next-env.d.ts`
- `package.json` → `frontend/package.json` (frontend deps only)
- `package-lock.json` → `frontend/package-lock.json`
- `tsconfig.json` → `frontend/tsconfig.json` (update paths)
- `tailwind.config.ts` → `frontend/tailwind.config.ts` (update content paths)
- `postcss.config.js` → `frontend/postcss.config.js`
- `.env.local.example` → `frontend/.env.local.example`

## Files to Update
- `next.config.js` - Update paths
- `tsconfig.json` - Update baseUrl and paths
- `tailwind.config.ts` - Update content paths
- `package.json` - Update scripts to run from frontend/

## Root Level Files (Keep)
- `components.json` - shadcn config (can stay or move)
- `design_guidelines.md`
- `MIGRATION_COMPLETE.md`
- `FRONTEND_SETUP.md`
- `FRONTEND_MIGRATION_SUMMARY.md`
- `shared/` - Shared types

