#!/bin/bash

# Test Gumloop Webhook Integration
# This script simulates a Gumloop webhook response to test your integration

# Configuration
WEBHOOK_URL="${1:-http://localhost:3000/api/gumloop/webhook}"
STRATEGY_ID="${2:-replace-with-actual-strategy-id}"
WEBHOOK_SECRET="${3:-your-optional-secret}"

echo "🧪 Testing Gumloop Webhook Integration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Webhook URL: $WEBHOOK_URL"
echo "Strategy ID: $STRATEGY_ID"
echo ""

# Test payload
PAYLOAD=$(cat <<EOF
{
  "strategyId": "$STRATEGY_ID",
  "result": {
    "status": "complete",
    "priorities": {
      "markdown": "# Strategic Priorities\n\n## 1. Build Clinical Evidence Base\n\n- Target high-impact KOLs at Memorial Hospital\n- Focus on late-stage breast cancer patients\n- Gather real-world evidence data\n\n## 2. Engage Key Stakeholders\n\n- Schedule quarterly meetings with Dr. Smith\n- Present at tumor board meetings\n\n## 3. Establish Advisory Board\n\n- Recruit 5-7 leading oncologists\n- Meet quarterly to review latest data",
      "sources": [
        "https://pubmed.ncbi.nlm.nih.gov/12345678",
        "https://clinicaltrials.gov/ct2/show/NCT98765432"
      ]
    },
    "keyAssets": {
      "markdown": "# Key Assets & Resources\n\n## Clinical Studies\n\n- **STUDY-001**: Phase 3 trial showing 40% improvement in progression-free survival\n- **RWE Data**: Real-world evidence from 500+ patients\n- **Meta-Analysis**: Comprehensive review of treatment efficacy\n\n## Medical Affairs Materials\n\n- Oncology clinical overview deck\n- Breast cancer therapy landscape analysis\n- Patient case studies\n\n## Published Evidence\n\n- 15 peer-reviewed publications\n- 8 conference presentations",
      "sources": [
        "https://example.com/study-results.pdf",
        "https://nejm.org/doi/full/12345"
      ]
    },
    "opportunities": {
      "markdown": "# Strategic Opportunities\n\n## Immediate (0-3 months)\n\n- Schedule meeting with Dr. Smith to review latest clinical data\n- Submit abstract for upcoming ASH conference\n- Launch targeted email campaign to oncology community\n\n## Medium-term (3-6 months)\n\n- Establish advisory board with 5 KOLs\n- Launch peer-to-peer education program\n- Develop co-authored publication with Memorial team\n\n## Long-term (6-12 months)\n\n- Expand to additional institutions\n- Present at international oncology conference\n- Build advocacy network",
      "sources": [
        "https://example.com/conference-dates.html"
      ]
    },
    "contacts": {
      "markdown": "# Key Contacts\n\n## Primary Stakeholders\n\n### Dr. Jane Smith\n- **Role**: Chief of Oncology, Memorial Hospital\n- **Specialty**: Breast Cancer\n- **Email**: j.smith@memorial.org\n- **Notes**: Highly influential, published 50+ papers on breast cancer treatments\n- **Last Contact**: 2025-01-15\n\n### Dr. Robert Johnson\n- **Role**: Director of Clinical Research\n- **Specialty**: Oncology Trials\n- **Email**: r.johnson@memorial.org\n- **Notes**: Key decision maker for trial participation\n\n## Secondary Contacts\n\n### Sarah Williams, PharmD\n- **Role**: Pharmacy Director\n- **Email**: s.williams@memorial.org\n- **Notes**: Manages formulary decisions",
      "sources": [
        "https://memorial.org/physicians/dr-smith",
        "https://linkedin.com/in/dr-jane-smith"
      ]
    }
  }
}
EOF
)

echo "📤 Sending webhook request..."
echo ""

# Send the request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "x-gumloop-signature: $WEBHOOK_SECRET" \
  -d "$PAYLOAD")

# Parse response
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "📥 Response:"
echo "Status Code: $HTTP_CODE"
echo ""
echo "Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Interpret results
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Success! Strategy updated successfully."
  echo ""
  echo "Next steps:"
  echo "1. Check your app at http://localhost:3000"
  echo "2. Click on the strategy in the sidebar"
  echo "3. You should see the results displayed in cards"
elif [ "$HTTP_CODE" = "400" ]; then
  echo "❌ Bad Request - Check your payload format"
elif [ "$HTTP_CODE" = "401" ]; then
  echo "❌ Unauthorized - Check your webhook secret"
elif [ "$HTTP_CODE" = "500" ]; then
  echo "❌ Server Error - Check server logs"
else
  echo "❌ Unexpected response code: $HTTP_CODE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

