# Quick Deploy Script
# Run this to deploy HALS Platform to Vercel

Write-Host "Deploying HALS Platform to Vercel..." -ForegroundColor Cyan

# Deploy using the existing configuration
vercel deploy --prod --yes

Write-Host "`nDeployment complete! Check the URL above." -ForegroundColor Green
