# Test Gumloop Webhook Integration
# PowerShell script to simulate a Gumloop webhook response

param(
    [string]$WebhookUrl = "http://localhost:3000/api/gumloop/webhook",
    [string]$StrategyId = "replace-with-actual-strategy-id",
    [string]$WebhookSecret = "your-optional-secret"
)

Write-Host "🧪 Testing Gumloop Webhook Integration" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Webhook URL: $WebhookUrl"
Write-Host "Strategy ID: $StrategyId"
Write-Host ""

$payload = @{
    strategyId = $StrategyId
    result = @{
        status = "complete"
        priorities = @{
            markdown = @"
# Strategic Priorities

## 1. Build Clinical Evidence Base

- Target high-impact KOLs at Memorial Hospital
- Focus on late-stage breast cancer patients
- Gather real-world evidence data

## 2. Engage Key Stakeholders

- Schedule quarterly meetings with Dr. Smith
- Present at tumor board meetings

## 3. Establish Advisory Board

- Recruit 5-7 leading oncologists
- Meet quarterly to review latest data
"@
            sources = @(
                "https://pubmed.ncbi.nlm.nih.gov/12345678",
                "https://clinicaltrials.gov/ct2/show/NCT98765432"
            )
        }
        keyAssets = @{
            markdown = @"
# Key Assets & Resources

## Clinical Studies

- **STUDY-001**: Phase 3 trial showing 40% improvement in progression-free survival
- **RWE Data**: Real-world evidence from 500+ patients
- **Meta-Analysis**: Comprehensive review of treatment efficacy

## Medical Affairs Materials

- Oncology clinical overview deck
- Breast cancer therapy landscape analysis
- Patient case studies

## Published Evidence

- 15 peer-reviewed publications
- 8 conference presentations
"@
            sources = @(
                "https://example.com/study-results.pdf",
                "https://nejm.org/doi/full/12345"
            )
        }
        opportunities = @{
            markdown = @"
# Strategic Opportunities

## Immediate (0-3 months)

- Schedule meeting with Dr. Smith to review latest clinical data
- Submit abstract for upcoming ASH conference
- Launch targeted email campaign to oncology community

## Medium-term (3-6 months)

- Establish advisory board with 5 KOLs
- Launch peer-to-peer education program
- Develop co-authored publication with Memorial team

## Long-term (6-12 months)

- Expand to additional institutions
- Present at international oncology conference
- Build advocacy network
"@
            sources = @(
                "https://example.com/conference-dates.html"
            )
        }
        contacts = @{
            markdown = @"
# Key Contacts

## Primary Stakeholders

### Dr. Jane Smith
- **Role**: Chief of Oncology, Memorial Hospital
- **Specialty**: Breast Cancer
- **Email**: j.smith@memorial.org
- **Notes**: Highly influential, published 50+ papers on breast cancer treatments
- **Last Contact**: 2025-01-15

### Dr. Robert Johnson
- **Role**: Director of Clinical Research
- **Specialty**: Oncology Trials
- **Email**: r.johnson@memorial.org
- **Notes**: Key decision maker for trial participation

## Secondary Contacts

### Sarah Williams, PharmD
- **Role**: Pharmacy Director
- **Email**: s.williams@memorial.org
- **Notes**: Manages formulary decisions
"@
            sources = @(
                "https://memorial.org/physicians/dr-smith",
                "https://linkedin.com/in/dr-jane-smith"
            )
        }
    }
} | ConvertTo-Json -Depth 10

Write-Host "📤 Sending webhook request..." -ForegroundColor Yellow
Write-Host ""

try {
    $headers = @{
        "Content-Type" = "application/json"
        "x-gumloop-signature" = $WebhookSecret
    }
    
    $response = Invoke-WebRequest -Uri $WebhookUrl `
        -Method Post `
        -Headers $headers `
        -Body $payload `
        -UseBasicParsing
    
    Write-Host "📥 Response:" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host ""
    Write-Host "Body:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    Write-Host ""
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Success! Strategy updated successfully." -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:"
        Write-Host "1. Check your app at http://localhost:3000"
        Write-Host "2. Click on the strategy in the sidebar"
        Write-Host "3. You should see the results displayed in cards"
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "Bad Request - Check your payload format" -ForegroundColor Red
    } elseif ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "Unauthorized - Check your webhook secret" -ForegroundColor Red
    } elseif ($_.Exception.Response.StatusCode.value__ -eq 500) {
        Write-Host "Server Error - Check server logs" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Usage instructions
Write-Host ""
Write-Host "Usage:" -ForegroundColor Cyan
Write-Host "  .\scripts\test-gumloop-webhook.ps1 -StrategyId 'your-strategy-id'"
Write-Host "  .\scripts\test-gumloop-webhook.ps1 -WebhookUrl 'https://your-domain.com/api/gumloop/webhook' -StrategyId 'your-strategy-id' -WebhookSecret 'your-secret'"

