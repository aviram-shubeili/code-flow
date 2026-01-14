# PowerShell Database Reset Script for Windows
# Stops database, removes data, starts fresh, runs migrations, and seeds

Write-Host "🔄 Resetting local database..." -ForegroundColor Cyan

Write-Host "  Stopping PostgreSQL container..." -ForegroundColor Gray
docker-compose --env-file .env.local down

Write-Host "  Starting PostgreSQL container..." -ForegroundColor Gray
docker-compose --env-file .env.local up -d postgres

Write-Host "  Waiting for PostgreSQL to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host "  Running database migrations..." -ForegroundColor Gray
npx prisma migrate dev

Write-Host "  Seeding database..." -ForegroundColor Gray
npm run db:seed

Write-Host "✅ Database reset complete!" -ForegroundColor Green
