#!/bin/bash
# Database Reset Script for Local Development
# Stops database, removes data, starts fresh, runs migrations, and seeds

set -e

echo "🔄 Resetting local database..."

echo "  Stopping PostgreSQL container..."
docker-compose --env-file .env.local down

echo "  Starting PostgreSQL container..."
docker-compose --env-file .env.local up -d postgres

echo "  Waiting for PostgreSQL to be ready..."
sleep 5

echo "  Running database migrations..."
npx prisma migrate dev

echo "  Seeding database..."
npm run db:seed

echo "✅ Database reset complete!"
