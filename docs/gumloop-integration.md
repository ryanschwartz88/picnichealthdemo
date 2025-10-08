# Gumloop Integration Guide

## Overview

This application integrates with Gumloop to generate AI-powered account strategies. When a user creates a strategy, the app triggers your Gumloop pipeline, which processes the data and sends results back via webhook.

## Quick Setup

### 1. Environment Variables

Add these to your `.env.local`:

```env
# Gumloop Configuration
GUMLOOP_TRIGGER_URL=https://api.gumloop.com/api/v1/start_pipeline?user_id=PLsUgrNrWcQJoQWUyrOkBigki052&saved_item_id=5HJsZAc7jLVUXDaLgxHmKa
GUMLOOP_API_KEY=2641e51726774bdb9b8e2851689235a1
GUMLOOP_WEBHOOK_SECRET=optional-secret-for-security
```

### 2. Configure Webhook in Gumloop

In your Gumloop pipeline settings, configure the webhook to call:

```
Production: https://your-domain.com/api/gumloop/webhook
Development: http://localhost:3000/api/gumloop/webhook
```

**Optional Security:** Add a custom header `x-gumloop-signature` with the value from `GUMLOOP_WEBHOOK_SECRET`

---

## Data Flow

```
User submits form
    ↓
App stores strategy (status: "generating")
    ↓
App triggers Gumloop pipeline → POST to your trigger URL
    ↓
Gumloop processes data
    ↓
Gumloop sends results → POST to /api/gumloop/webhook
    ↓
App updates strategy (status: "complete")
    ↓
User sees results
```

---

## Request Format (App → Gumloop)

When a strategy is created, the app sends this payload to your Gumloop pipeline:

### Endpoint
```
POST https://api.gumloop.com/api/v1/start_pipeline?user_id=PLsUgrNrWcQJoQWUyrOkBigki052&saved_item_id=5HJsZAc7jLVUXDaLgxHmKa
```

### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer 2641e51726774bdb9b8e2851689235a1"
}
```

### Request Body
```json
{
  "strategyId": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Q4 2025 Oncology Expansion",
  "context": "Focus on breast cancer treatments. Key stakeholders include Dr. Smith at Memorial Hospital. Looking to demonstrate efficacy in late-stage patients.",
  "accountName": "Memorial Health System",
  "focusArea": "Oncology - Breast Cancer",
  "customUrl": "https://example.com/research-paper.pdf",
  "fileUrl": "https://supabase.co/storage/v1/object/public/strategy-files/uploads/12345-brief.pdf"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `strategyId` | string (UUID) | ✅ | Unique strategy ID - use this to send results back |
| `title` | string | ✅ | Strategy title from user |
| `context` | string | ✅ | Detailed context and objectives |
| `accountName` | string | ❌ | Name of the pharmaceutical account |
| `focusArea` | string | ❌ | Therapy area or product focus |
| `customUrl` | string (URL) | ❌ | Reference URL provided by user |
| `fileUrl` | string (URL) | ❌ | Public URL to uploaded document in Supabase Storage |

---

## Response Format (Gumloop → App Webhook)

After processing, your Gumloop pipeline must send results to the webhook endpoint.

### Endpoint
```
POST https://your-domain.com/api/gumloop/webhook
```

### Headers
```json
{
  "Content-Type": "application/json",
  "x-gumloop-signature": "your-optional-secret"
}
```

### Request Body

```json
{
  "strategyId": "123e4567-e89b-12d3-a456-426614174000",
  "result": {
    "status": "complete",
    "priorities": {
      "markdown": "# Strategic Priorities\n\n## 1. Build Clinical Evidence Base\n\n- Target high-impact KOLs at Memorial Hospital\n- Focus on late-stage breast cancer patients\n- Gather real-world evidence data\n\n## 2. Engage Key Stakeholders\n\n- Schedule quarterly meetings with Dr. Smith\n- Present at tumor board meetings",
      "sources": [
        "https://pubmed.ncbi.nlm.nih.gov/12345678",
        "https://clinicaltrials.gov/ct2/show/NCT98765432"
      ]
    },
    "keyAssets": {
      "markdown": "# Key Assets & Resources\n\n## Clinical Studies\n\n- **STUDY-001**: Phase 3 trial showing 40% improvement in progression-free survival\n- **RWE Data**: Real-world evidence from 500+ patients\n\n## Medical Affairs Materials\n\n- Oncology clinical overview deck\n- Breast cancer therapy landscape analysis",
      "sources": [
        "https://example.com/study-results.pdf"
      ]
    },
    "opportunities": {
      "markdown": "# Strategic Opportunities\n\n## Immediate (0-3 months)\n\n- Schedule meeting with Dr. Smith to review latest clinical data\n- Submit abstract for upcoming ASH conference\n\n## Medium-term (3-6 months)\n\n- Establish advisory board with 5 KOLs\n- Launch peer-to-peer education program",
      "sources": []
    },
    "contacts": {
      "markdown": "# Key Contacts\n\n## Primary Stakeholders\n\n### Dr. Jane Smith\n- **Role**: Chief of Oncology, Memorial Hospital\n- **Specialty**: Breast Cancer\n- **Email**: j.smith@memorial.org\n- **Notes**: Highly influential, published 50+ papers on breast cancer treatments\n\n### Dr. Robert Johnson\n- **Role**: Director of Clinical Research\n- **Specialty**: Oncology Trials\n- **Email**: r.johnson@memorial.org",
      "sources": [
        "https://memorial.org/physicians/dr-smith"
      ]
    }
  }
}
```

### Response Schema

```typescript
{
  strategyId: string (UUID)      // REQUIRED - Must match the strategyId from request
  result: {
    status: "complete" | "failed"  // REQUIRED - Set to "complete" on success
    
    // Each section is OPTIONAL but recommended for best results
    priorities?: {
      markdown: string              // Markdown-formatted content
      sources?: string[]            // Array of source URLs
    }
    
    keyAssets?: {
      markdown: string
      sources?: string[]
    }
    
    opportunities?: {
      markdown: string
      sources?: string[]
    }
    
    contacts?: {
      markdown: string
      sources?: string[]
    }
  }
}
```

### Markdown Formatting Tips

The `markdown` fields support full Markdown syntax:
- Use `#` for headings
- Use `**bold**` for emphasis
- Use `-` or `*` for bullet lists
- Use `1.` for numbered lists
- Use `[text](url)` for links

---

## Testing Your Integration

### 1. Test Webhook Locally with curl

```bash
curl -X POST http://localhost:3000/api/gumloop/webhook \
  -H "Content-Type: application/json" \
  -H "x-gumloop-signature: your-secret" \
  -d '{
    "strategyId": "your-test-strategy-id",
    "result": {
      "status": "complete",
      "priorities": {
        "markdown": "# Test Priorities\n\nThis is a test.",
        "sources": ["https://example.com"]
      }
    }
  }'
```

### 2. Test Full Flow

1. Start your dev server: `npm run dev`
2. Create an account in the UI
3. Create a strategy with some context
4. Check your terminal for the Gumloop trigger log
5. Use curl to simulate the webhook response (use the strategyId from logs)
6. Refresh the UI to see results

### 3. Check Logs

The app logs all Gumloop interactions. Watch for:
- ✅ "Triggering Gumloop flow for strategy: {id}"
- ❌ "Failed to trigger Gumloop flow"
- ✅ "Webhook received for strategy: {id}"

---

## Error Handling

### If Gumloop Processing Fails

Set `status: "failed"` in the webhook response:

```json
{
  "strategyId": "123e4567-e89b-12d3-a456-426614174000",
  "result": {
    "status": "failed"
  }
}
```

The UI will show "Failed to generate strategy" to the user.

### Common Issues

| Issue | Solution |
|-------|----------|
| "Gumloop trigger URL is not configured" | Add `GUMLOOP_TRIGGER_URL` to `.env.local` |
| "Invalid signature" | Check `GUMLOOP_WEBHOOK_SECRET` or remove header |
| "Invalid payload" | Ensure webhook JSON matches the schema above |
| Strategy stuck in "generating" | Send a webhook response or retry with `status: "failed"` |

---

## Security Notes

1. **API Key**: Keep `GUMLOOP_API_KEY` secret - never commit to git
2. **Webhook Secret**: Optional but recommended for production
3. **File URLs**: Public Supabase Storage URLs expire eventually - process files within 24 hours
4. **Rate Limiting**: Consider rate limits if many users create strategies simultaneously

---

## Next Steps

1. ✅ Add environment variables to `.env.local`
2. ✅ Restart your dev server
3. ✅ Configure webhook URL in Gumloop dashboard
4. ✅ Test with curl to verify webhook format
5. ✅ Create a test strategy in the UI
6. ✅ Monitor logs for successful integration

---

Need help? Check the main `SETUP.md` or reach out to your Gumloop support contact.

