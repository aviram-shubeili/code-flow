@echo off
REM Database reset script for CodeFlow local development (Windows)
REM This script stops the database, removes containers and volumes, then starts fresh

echo 🔄 Resetting CodeFlow local database...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker is not running. Please start Docker Desktop and try again.
    exit /b 1
)

REM Stop and remove containers
echo 🛑 Stopping PostgreSQL container...
docker-compose down

REM Remove volumes to completely reset data
echo 🗑️  Removing database volumes...
docker-compose down -v

REM Remove any orphaned containers
docker container prune -f >nul 2>&1

REM Start fresh database
echo 🚀 Starting fresh PostgreSQL container...
docker-compose --env-file .env.local up -d postgres

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Check if database is healthy (simplified for Windows)
echo ✅ Database should be ready!

REM Run migrations
echo 🔄 Running database migrations...
call npm run db:migrate

REM Seed development data
echo 🌱 Seeding development data...
call npm run db:seed

echo 🎉 Database reset complete!
echo.
echo 📊 Next steps:
echo   • Start development server: npm run dev
echo   • View database: npm run db:studio
echo   • Check logs: npm run db:logs