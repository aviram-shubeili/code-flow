# PowerShell Database Seed Script for Windows
# Seeds the database with development data

Write-Host "🌱 Seeding database..." -ForegroundColor Cyan

tsx prisma/seed.ts

Write-Host "✅ Database seeded successfully!" -ForegroundColor Green
