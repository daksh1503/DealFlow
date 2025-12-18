# Obsolete Files - Can Be Removed

## 🗑️ Safe to Delete

### 1. Old Frontend (React + Vite)
- **`client/`** - Entire directory
  - Old React app with Vite
  - All code migrated to `frontend/` (Next.js)
  - **Reason:** Replaced by Next.js frontend

### 2. Old Backend (Express.js)
- **`server/`** - Entire directory
  - Old Express.js backend
  - Replit Auth integration
  - All routes migrated to FastAPI in `backend/`
  - **Reason:** Replaced by FastAPI backend

### 3. Old Build Configuration
- **`vite.config.ts`** - Vite configuration
  - **Reason:** Using Next.js build system now
- **`drizzle.config.ts`** - Drizzle ORM config
  - **Reason:** Using Prisma now (in `backend/prisma/`)
- **`script/build.ts`** - Old build script
  - **Reason:** No longer needed

### 4. Root Package Files (Optional)
- **`package.json`** (root) - Duplicate
  - Same as `frontend/package.json`
  - **Reason:** Can remove if not using workspace
- **`package-lock.json`** (root) - If removing package.json

### 5. Old Uploads (Optional)
- **`uploads/`** - Local file storage
  - **Reason:** Using Supabase Storage now
  - **Note:** Keep if you want local storage option

## ✅ Keep These

### Essential
- ✅ **`frontend/`** - Next.js frontend
- ✅ **`backend/`** - FastAPI backend
- ✅ **`shared/`** - TypeScript types (used by frontend)
- ✅ **`components.json`** - shadcn/ui config
- ✅ **`design_guidelines.md`** - Design reference

### Documentation (Keep for Reference)
- ✅ **`MIGRATION_COMPLETE.md`** - Migration summary
- ✅ **`ENV_SETUP.md`** - Environment setup
- ✅ **`CLEANUP_GUIDE.md`** - This file

## 📊 Summary

**Total Obsolete:**
- 2 directories: `client/`, `server/`
- 2 config files: `vite.config.ts`, `drizzle.config.ts`
- 1 script: `script/build.ts`
- Optional: Root `package.json`, `uploads/`

**Estimated Space:** ~10-15 MB (without node_modules)

## 🚀 Quick Cleanup

### Windows:
```powershell
.\cleanup.ps1
```

### Linux/Mac:
```bash
chmod +x cleanup.sh
./cleanup.sh
```

### Manual:
See `CLEANUP_GUIDE.md` for detailed instructions.

