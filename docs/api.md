# API Documentation

## Strategy Generation Workflow

### POST `/api/strategies`
Create a new strategy generation request. This endpoint stores the request in Supabase and triggers the Gumloop orchestration workflow.

#### Request Body
```json
{
  "accountId": "<uuid>",
  "title": "Q4 2025 Oncology Strategy",
  "context": "Detailed context on the account objectives...",
  "focusArea": "oncology",
  "customUrl": "https://reference.url/brief",
  "fileUrl": "https://drive.google.com/..."
}
```

| Field       | Type   | Required | Description                                                                               |
|-------------|--------|----------|-------------------------------------------------------------------------------------------|
| accountId   | UUID   | ✅       | Supabase account ID the strategy belongs to                                              |
| title       | string | ✅       | Strategy title                                                                            |
| context     | string | ✅       | Detailed context that guides the strategy generation                                     |
| focusArea   | string | ❌       | Optional focus area or product line                                                       |
| customUrl   | url    | ❌       | Optional reference URL for additional context                                             |
| fileUrl     | url    | ❌       | Optional link to supporting file (e.g., Google Drive, SharePoint)                        |

#### Response
```json
{
  "data": {
    "id": "<strategy-id>",
    "title": "Q4 2025 Oncology Strategy",
    "status": "generating",
    "inputs": {
      "context": "...",
      "focusArea": "oncology",
      "customUrl": "https://reference.url/brief",
      "fileUrl": "https://drive.google.com/..."
    },
    "createdAt": "2025-10-07T18:42:13.000Z"
  }
}
```

#### Errors
- `400` – Validation failed (missing required fields, invalid UUID/URL)
- `500` – Supabase insert failed or Gumloop trigger failed

#### Notes
- The strategy is created with `status = "generating"`.
- If the Gumloop trigger fails, the status is updated to `failed`.

### GET `/api/strategies`
Fetch strategies. Optionally filter by account ID.

#### Query Parameters
- `accountId` (optional) – UUID to filter strategies by account.

#### Response
```json
{
  "data": [
    {
      "id": "<strategy-id>",
      "accountId": "<account-id>",
      "title": "Q4 2025 Oncology Strategy",
      "status": "complete",
      "priorities": {
        "markdown": "## Top Priorities\n- ...",
        "sources": ["https://source1", "https://source2"]
      },
      "keyAssets": { ... },
      "opportunities": { ... },
      "contacts": { ... },
      "createdAt": "2025-10-07T18:42:13.000Z"
    }
  ]
}
```

---

## Uploads

### POST `/api/uploads`
Upload supporting documents to Supabase Storage.

#### Request
- `multipart/form-data` with fields:
  - `file` (required) – the uploaded file
  - `accountId` (optional) – used for namespacing
  - `strategyId` (optional) – used for namespacing

#### Response
```json
{
  "data": {
    "path": "uploads/<accountId>/<timestamp>-file.pdf",
    "url": "https://...supabase.co/storage/v1/object/public/strategy-files/uploads/...",
    "name": "file.pdf",
    "size": 12345,
    "type": "application/pdf",
    "id": "9b2a..."
  }
}
```

Uploaded files are stored in the `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` (default: `strategy-files`). If the bucket doesn’t exist it will be created automatically (public read access).

---

## Gumloop Webhook

### POST `/api/gumloop/webhook`
Endpoint called by Gumloop once the orchestration workflow completes.

#### Expected Payload
```json
{
  "strategyId": "<strategy-id>",
  "result": {
    "status": "complete",
    "priorities": {
      "markdown": "## Top Priorities\n\n- Expand oncology trials\n- ...",
      "sources": ["https://source1", "https://source2"]
    },
    "keyAssets": { ... },
    "opportunities": { ... },
    "contacts": { ... }
  }
}
```

#### Processing Steps
1. Validate webhook signature (optional) using `GUMLOOP_WEBHOOK_SECRET`.
2. Update the strategy record in Supabase:
   - `status` → `complete`
   - Store markdown sections in `priorities`, `key_assets`, `opportunities`, `contacts`
3. (Optional) Trigger realtime updates if subscribed

#### Response
- `200` – Webhook processed successfully
- `400` – Validation failed
- `401` – Invalid signature (if secret configured)
- `500` – Supabase update failed

---

## Supabase Tables

### `accounts`
| Column     | Type        | Description                     |
|------------|-------------|---------------------------------|
| id         | uuid        | Primary key                     |
| name       | text        | Account name                    |
| created_at | timestamptz | Timestamp (defaults to NOW)     |

### `strategies`
| Column        | Type        | Description                                              |
|---------------|-------------|----------------------------------------------------------|
| id            | uuid        | Primary key                                              |
| account_id    | uuid        | Foreign key → accounts.id                                |
| user_id       | uuid        | Optional Supabase user ID                                |
| title         | text        | Strategy title                                           |
| status        | text        | `pending`, `generating`, `complete`, `failed`            |
| inputs        | jsonb       | JSON payload (context, focusArea, customUrl, fileUrl)    |
| priorities    | jsonb       | Markdown + sources for priorities                        |
| key_assets    | jsonb       | Markdown + sources for key assets                        |
| opportunities | jsonb       | Markdown + sources for opportunities                     |
| contacts      | jsonb       | Markdown + sources for key contacts                      |
| created_at    | timestamptz | Timestamp (defaults to NOW)                               |

### `strategy-files` bucket (Storage)
- Stores uploaded supporting documents.
- Public read access to allow Gumloop to fetch files.

---

## Environment Variables

| Variable                         | Required | Description                                             |
|----------------------------------|----------|---------------------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`       | ✅       | Supabase project URL                                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | ✅       | Supabase anon public key                                |
| `SUPABASE_SERVICE_ROLE_KEY`      | ✅       | Supabase service role key (server-side usage only)      |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | ✅ | Storage bucket name (default `strategy-files`)          |
| `GUMLOOP_TRIGGER_URL`            | ✅       | Gumloop workflow trigger endpoint                       |
| `GUMLOOP_API_KEY`                | ❌       | Optional Gumloop API key for authenticated requests     |
| `GUMLOOP_WEBHOOK_SECRET`         | ❌       | Optional shared secret to validate webhook payloads     |

---

## Example CURL Commands

### Create Strategy
```bash
curl -X POST http://localhost:3000/api/strategies \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "<account-id>",
    "title": "Q4 2025 Oncology Strategy",
    "context": "We are focusing on the oncology franchise...",
    "focusArea": "Oncology",
    "customUrl": "https://company.com/strategy-overview",
    "fileUrl": "https://drive.google.com/..."
  }'
```

### Upload a File
```bash
curl -X POST http://localhost:3000/api/uploads \
  -F "file=@./brief.pdf" \
  -F "accountId=<account-id>"
```

### Receive Webhook (simulate Gumloop)
```bash
curl -X POST http://localhost:3000/api/gumloop/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "strategyId": "<strategy-id>",
    "result": {
      "status": "complete",
      "priorities": {
        "markdown": "## Top Priorities\n- Expand oncology trials",
        "sources": ["https://source1"]
      }
    }
  }'
```
