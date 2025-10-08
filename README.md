# PicnicHealth - Account Strategy Planning

> **AI-powered account strategy planning with a beautiful form-based workflow**

![Architecture Diagram](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)

Generate comprehensive account strategies using Supabase + Gumloop orchestration. Provide structured context, optional documents, and receive rich markdown results grouped by priorities, assets, opportunities, and contacts.

## ✨ Features

- 🎯 **Form-based strategy creation** – Choose account, describe context, attach files
- 📂 **Supabase storage integration** – Upload supporting documents securely
- 🤖 **Gumloop orchestration** – Triggers AI workflows to generate strategies
- 📄 **Markdown results** – Expandable cards with sources & rich formatting
- 📚 **Strategy history** – Sidebar lists strategies grouped by account
- ⚡ **Realtime updates** – Webhook updates status from `generating` → `complete`
- 📋 **Account management** – Create accounts via modal, RLS policies enforced

## 🚀 Quick Start

1. **Clone & install**
   ```bash
   git clone <your-repo-url>
   cd picnichealthdemo
   npm install
   ```

2. **Configure Supabase**
   - Run SQL in `lib/database/migrations/001_initial_schema.sql`
   - Create storage bucket `strategy-files` (public)

3. **Environment variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=strategy-files
   GUMLOOP_TRIGGER_URL=https://api.gumloop.com/flows/<your-flow-id>
   GUMLOOP_API_KEY=your-gumloop-api-key
   GUMLOOP_WEBHOOK_SECRET=optional-secret
   ```

4. **Start dev server**
   ```bash
   npm run dev
   ```

5. **Open app** at `http://localhost:3000`

## 🗂️ Workflow Summary

1. **Create account** – Sidebar → "New Account"
2. **Generate strategy** – Fill form (title, context, optional doc)
3. **Supabase** stores request (`status=generating`)
4. **Gumloop** triggered via POST to `GUMLOOP_TRIGGER_URL`
5. **Webhook** updates strategy with markdown sections
6. **Results** displayed as cards with expand/collapse & sources

## 🧠 Strategy Form Fields

| Field       | Required | Notes                                      |
|-------------|----------|---------------------------------------------|
| Account     | ✅       | Select from existing accounts               |
| Title       | ✅       | Strategy title                              |
| Context     | ✅       | Detailed objectives, focus areas            |
| Focus Area  | ❌       | Optional product/therapy focus               |
| Reference URL| ❌      | Optional supporting link                     |
| Upload File | ❌       | Uses Supabase Storage, returns public URL    |

## 🛠️ API Overview

| Endpoint                    | Description                               |
|-----------------------------|-------------------------------------------|
| `POST /api/accounts`        | Create account                            |
| `GET /api/accounts`         | List accounts                             |
| `POST /api/strategies`      | Create strategy request, trigger Gumloop  |
| `GET /api/strategies`       | List strategies (optional `accountId`)    |
| `POST /api/uploads`         | Upload file to Supabase Storage           |
| `POST /api/gumloop/webhook` | Receive strategy results from Gumloop     |

See `docs/api.md` for full documentation.

## 📦 Tech Stack

- **Framework:** Next.js App Router
- **UI:** React 19 + shadcn/ui
- **State:** SWR hooks, custom context
- **Database:** Supabase Postgres + Storage
- **Auth:** Anonymous-friendly (optional)
- **Workflow:** Gumloop orchestration + webhook
- **Markdown:** `react-markdown` with `remark-gfm`

## 🧪 Testing

- `curl /api/health` – basic health check
- Create account & strategy via REST or UI
- Simulate Gumloop webhook using curl

## 🚢 Deployment Tips

- Deploy Next.js app on Vercel
- Set environment variables in Vercel dashboard
- Ensure Supabase bucket exists with public access
- Optional: configure Gumloop webhook pointing to production URL

## 📚 Documentation

- `docs/development.md` – setup & workflow details
- `docs/api.md` – API contracts and examples
- `docs/INTERFACE_GUIDE.md` – UX overview & diagrams
- `ENABLE_ANONYMOUS_AUTH.md` – optional auth instructions

## 📝 License

MIT License

---

Built with ❤️ for PicnicHealth to accelerate evidence strategy planning.
