# PowerShell Database Reset Script for Windows
# Stops database, removes data, starts fresh, runs migrations, and seeds

Write-Host "🔄 Resetting local database..." -ForegroundColor Cyan

Write-Host "  Stopping PostgreSQL container..." -ForegroundColor Gray
docker-compose --env-file .env.local down

Write-Host "  Starting PostgreSQL container..." -ForegroundColor Gray
docker-compose --env-file .env.local up -d postgres

Write-Host "  Waiting for PostgreSQL to be ready..." -ForegroundColor Gray
$maxAttempts = 30
$attempt = 0
while ($attempt -lt $maxAttempts) {
    docker-compose --env-file .env.local exec -T postgres pg_isready -U postgres | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    PostgreSQL is ready." -ForegroundColor Green
        break
    }

    $attempt++
    Start-Sleep -Seconds 1
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ PostgreSQL did not become ready in time. Aborting." -ForegroundColor Red
    exit 1
}
Write-Host "  Running database migrations..." -ForegroundColor Gray
npx prisma migrate dev

Write-Host "  Seeding database..." -ForegroundColor Gray
npm run db:seed

Write-Host "✅ Database reset complete!" -ForegroundColor Green
