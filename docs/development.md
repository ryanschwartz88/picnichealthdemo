# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git

### Step 1: Supabase Setup

1. **Create a Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Click "Start your project"
   - Create a new organization (if needed)
   - Create a new project
   - Wait for the project to be provisioned (~2 minutes)

2. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy the `Project URL` (e.g., `https://xxxxx.supabase.co`)
   - Copy the `anon public` key (under "Project API keys")
   - Copy the `service_role` key (used for server-side operations)

3. **Run Database Migration**
   - Go to SQL Editor in your Supabase dashboard
   - Click "New Query"
   - Copy the contents of `lib/database/migrations/001_initial_schema.sql`
   - Paste and click "Run"
   - Verify the tables were created in the Table Editor

4. **Configure Storage**
   - Open Storage → Create new bucket named `strategy-files`
   - Set it to public access
   - Enable file uploads up to 50MB (optional adjustment)

### Step 2: Environment Configuration

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=strategy-files
GUMLOOP_TRIGGER_URL=https://api.gumloop.com/flows/<your-flow-id>
GUMLOOP_API_KEY=your-gumloop-api-key
GUMLOOP_WEBHOOK_SECRET=optional-shared-secret
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

---

## Workflow Overview

### 1. Create Accounts
- Use the "New Account" button in the sidebar
- Fill in the account name; Supabase stores accounts in `accounts` table

### 2. Generate Strategies
- Select "New Strategy"
- Fill out form: choose account, describe context, optionally provide focus area, reference links, or upload supporting files
- Files are uploaded to Supabase Storage (`strategy-files` bucket) and linked in the request
- Submission creates a strategy record in Supabase (`status = generating`) and triggers Gumloop via the trigger URL

### 3. Gumloop Processing
- Gumloop workflow should process inputs, gather intelligence, and send results to `/api/gumloop/webhook`
- Webhook updates the strategy record with markdown sections (priorities, key assets, opportunities, contacts) and sets `status = complete`

### 4. Viewing Results
- Completed strategies show Markdown cards with expand/collapse
- Source links appear under each section
- Sidebar lists strategies grouped by account for quick access

---

## API Endpoints

See `docs/api.md` for detailed request/response contracts.

Key endpoints:
- `POST /api/strategies` – create a strategy request
- `GET /api/strategies` – list strategies (optional `accountId` filter)
- `POST /api/uploads` – upload files to Supabase Storage
- `POST /api/gumloop/webhook` – receive orchestrated results from Gumloop

---

## Testing the Workflow

### Create Account
```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Account"}'
```

### Create Strategy
```bash
curl -X POST http://localhost:3000/api/strategies \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "<account-uuid>",
    "title": "Q4 2025 Launch Plan",
    "context": "Focus on oncology therapy area with expansion in EU.",
    "focusArea": "Oncology",
    "customUrl": "https://reference-url.example",
    "fileUrl": "https://drive.google.com/..."
  }'
```

### Simulate Gumloop Webhook
```bash
curl -X POST http://localhost:3000/api/gumloop/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "strategyId": "<strategy-uuid>",
    "result": {
      "status": "complete",
      "priorities": {
        "markdown": "## Top Priorities\n- Expand clinical trials",
        "sources": ["https://source1"]
      }
    }
  }'
```

---

## Common Issues

### Anonymous auth disabled (expected)
- App works without authentication
- To enable per-user tracking, turn on anonymous sign-ins in Supabase → Auth → Providers

### File uploads failing
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set
- Confirm storage bucket exists (`strategy-files`) and is public
- Check server logs for details

### Strategies stuck in generating
- Verify Gumloop webhook is configured to call `/api/gumloop/webhook`
- Check Supabase `strategies` table for errors
- Use ngrok or similar tool to expose local server for webhook testing

---

## Deployment Notes

### Vercel
- Add all environment variables in Vercel project settings
- Include Supabase service role key (marked as encrypted secret)
- Ensure `strategy-files` bucket exists in production Supabase project

### Supabase
- Enable RLS policies as defined in migration
- Validate webhook secret in production
- Monitor Supabase logs for errors

---

## Next Steps

1. Complete Gumloop flow configuration using `GUMLOOP_TRIGGER_URL`
2. Add authentication (optional) for multi-user support
3. Implement history filters (by status, date range)
4. Add export options (PDF, PowerPoint)
5. Integrate notifications (email, Slack) when strategies complete

