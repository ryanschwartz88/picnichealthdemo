# Gumloop Integration - Quick Reference Card

## 🔑 Your Credentials

Add these to `.env.local`:

```env
GUMLOOP_TRIGGER_URL=https://api.gumloop.com/api/v1/start_pipeline?user_id=PLsUgrNrWcQJoQWUyrOkBigki052&saved_item_id=5HJsZAc7jLVUXDaLgxHmKa
GUMLOOP_API_KEY=2641e51726774bdb9b8e2851689235a1
GUMLOOP_WEBHOOK_SECRET=your-optional-secret
```

## 📤 What the App Sends to Gumloop

```json
{
  "strategyId": "uuid-string",
  "title": "Strategy title from user",
  "context": "Detailed context from user",
  "accountName": "Account name",
  "focusArea": "Optional focus area",
  "customUrl": "Optional reference URL",
  "fileUrl": "Optional uploaded file URL"
}
```

## 📥 What Gumloop Must Send Back

**Webhook Endpoint:** `https://your-domain.com/api/gumloop/webhook`

```json
{
  "strategyId": "same-uuid-from-request",
  "result": {
    "status": "complete",
    "priorities": {
      "markdown": "# Markdown content here",
      "sources": ["https://url1.com", "https://url2.com"]
    },
    "keyAssets": {
      "markdown": "# Markdown content",
      "sources": []
    },
    "opportunities": {
      "markdown": "# Markdown content",
      "sources": []
    },
    "contacts": {
      "markdown": "# Markdown content",
      "sources": []
    }
  }
}
```

## ✅ Testing Steps

### 1. Add Environment Variables
```bash
# Edit .env.local and add the credentials above
# Restart your dev server: npm run dev
```

### 2. Configure Gumloop Webhook
Set your Gumloop pipeline to call:
- Development: `http://localhost:3000/api/gumloop/webhook`
- Production: `https://your-domain.com/api/gumloop/webhook`

### 3. Test with PowerShell (Windows)
```powershell
# Create a strategy in the UI first to get a strategyId
# Then run:
.\scripts\test-gumloop-webhook.ps1 -StrategyId "your-strategy-id-here"
```

### 4. Test with Bash (Mac/Linux)
```bash
# Create a strategy in the UI first to get a strategyId
# Then run:
bash scripts/test-gumloop-webhook.sh http://localhost:3000/api/gumloop/webhook your-strategy-id-here
```

## 🎯 What Each Section Should Contain

| Section | Purpose | Example Content |
|---------|---------|-----------------|
| **Priorities** | Strategic priorities and action items | "Build clinical evidence", "Engage stakeholders" |
| **Key Assets** | Available resources and materials | "Phase 3 trial data", "Clinical overview deck" |
| **Opportunities** | Actionable opportunities with timeline | "Schedule KOL meeting (0-3 months)", "Launch advisory board" |
| **Contacts** | Key stakeholders with contact info | "Dr. Smith - Chief of Oncology - j.smith@hospital.org" |

## 📝 Markdown Tips

```markdown
# Use headings for structure
## Subheadings for categories
### Third level for specific items

- Bullet points for lists
1. Numbered lists for sequences

**Bold** for emphasis
*Italic* for subtle emphasis

[Link text](https://example.com) for sources
```

## 🚨 Common Issues

| Error | Fix |
|-------|-----|
| "Gumloop trigger URL is not configured" | Add `GUMLOOP_TRIGGER_URL` to `.env.local` and restart |
| "Invalid signature" | Check `GUMLOOP_WEBHOOK_SECRET` matches in both places |
| Strategy stuck in "generating" | Send webhook with `status: "failed"` to reset |
| "Invalid payload" | Check JSON format matches schema exactly |

## 📚 Full Documentation

For complete details, see:
- **Setup**: `SETUP.md`
- **Full Integration Guide**: `docs/gumloop-integration.md`
- **API Docs**: `docs/api.md`

---

**Quick Start:** Add credentials to `.env.local`, restart server, create a strategy, test the webhook!

