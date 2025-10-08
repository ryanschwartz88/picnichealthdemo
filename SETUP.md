# Quick Setup Guide

Get the Account Strategy Planning Tool running in 5 minutes.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. **Create Account**: Go to [supabase.com](https://supabase.com) and create a free account
2. **Create Project**: Create a new project (takes ~2 min to provision)
3. **Get Credentials**:
   - Go to Project Settings → API
   - Copy your `Project URL`
   - Copy your `anon public` key

### 3. Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents from `lib/database/migrations/001_initial_schema.sql`
4. Click **Run** to execute
5. Verify tables in **Table Editor** tab

### 4. Configure Environment

Create `.env.local` in project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Supabase Storage
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=strategy-files

# Gumloop Configuration
# Your actual Gumloop pipeline URL and API key
GUMLOOP_TRIGGER_URL=https://api.gumloop.com/api/v1/start_pipeline?user_id=PLsUgrNrWcQJoQWUyrOkBigki052&saved_item_id=5HJsZAc7jLVUXDaLgxHmKa
GUMLOOP_API_KEY=2641e51726774bdb9b8e2851689235a1
GUMLOOP_WEBHOOK_SECRET=your-optional-secret
```

**How to get your Supabase keys:**
1. Go to your Supabase project dashboard
2. Click **Project Settings** (gear icon) → **API**
3. Copy `Project URL` → use for `NEXT_PUBLIC_SUPABASE_URL`
4. Copy `anon public` key → use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy `service_role` key (under "Project API keys") → use for `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ **Keep service_role key secret** - it bypasses Row Level Security

### 5. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## ✅ Verify Setup

### Test Health Endpoint
```bash
curl http://localhost:3000/api/health
# Expected: {"status":"ok","timestamp":...}
```

### Test Accounts API
```bash
curl http://localhost:3000/api/accounts
# Expected: {"data":[...]} with sample accounts
```

### Check Browser
- Navigate to http://localhost:3000
- You should see the dashboard with sidebar
- Sample accounts should be visible

## 🔧 Troubleshooting

### "Supabase server environment variables are missing"
→ You're missing `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
→ Go to Supabase dashboard → Project Settings → API → copy the `service_role` key
→ Add it to `.env.local` and restart your dev server

### "Environment variables are missing"
→ Ensure `.env.local` exists in project root with all required Supabase credentials
→ Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### "Cannot find module"
→ Run `npm install` again

### Empty data in API
→ Check Supabase Table Editor to ensure migration ran successfully

### Port 3000 already in use
→ Use a different port: `npm run dev -- -p 3001`

## 📚 What's Next?

- **Gumloop Integration**: See `docs/gumloop-integration.md` for detailed data formats
- **Read**: Full setup in `docs/development.md`
- **Deploy**: See `docs/deployment.md`
- **API Docs**: See `docs/api.md`

## 🎯 Test the Application

### Create an Account
```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Company"}'
```

### Create a Strategy
```bash
curl -X POST http://localhost:3000/api/strategies \
  -H "Content-Type: application/json" \
  -d '{
    "account_id":"<account-id-from-above>",
    "title":"Test Strategy",
    "status":"pending"
  }'
```

## 🔐 Database Schema

The migration creates:
- ✅ `accounts` table - pharmaceutical companies
- ✅ `strategies` table - AI-generated strategies
- ✅ Indexes for performance
- ✅ RLS policies (permissive for prototype)
- ✅ Sample seed data

## 📝 Notes

- **RLS is enabled** but permissive for prototype (allows anonymous access)
- **Sample data** is automatically seeded (5 accounts, 1 strategy)
- **Gumloop** integration is optional for initial testing
- **Real-time** updates work out of the box with Supabase

---

Need help? Check `docs/development.md` for detailed instructions.

