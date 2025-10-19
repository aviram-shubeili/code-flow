#!/bin/bash
# Database reset script for CodeFlow local development
# This script stops the database, removes containers and volumes, then starts fresh

set -e

echo "🔄 Resetting CodeFlow local database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Stop and remove containers
echo "🛑 Stopping PostgreSQL container..."
docker-compose down

# Remove volumes to completely reset data
echo "🗑️  Removing database volumes..."
docker-compose down -v

# Remove any orphaned containers
docker container prune -f > /dev/null 2>&1 || true

# Start fresh database
echo "🚀 Starting fresh PostgreSQL container..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is healthy
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    if docker-compose exec -T postgres pg_isready -U codeflow -d codeflow_dev > /dev/null 2>&1; then
        echo "✅ Database is ready!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Database failed to start after $max_attempts attempts"
        docker-compose logs postgres
        exit 1
    fi
    
    echo "⏳ Attempt $attempt/$max_attempts - waiting for database..."
    sleep 2
    ((attempt++))
done

# Run migrations
echo "🔄 Running database migrations..."
npm run db:migrate

# Seed development data
echo "🌱 Seeding development data..."
npm run db:seed

echo "🎉 Database reset complete!"
echo ""
echo "📊 Next steps:"
echo "  • Start development server: npm run dev"
echo "  • View database: npm run db:studio"
echo "  • Check logs: npm run db:logs"