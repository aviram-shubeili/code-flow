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
max_retries=30
for i in $(seq 1 "$max_retries"); do
  if docker-compose --env-file .env.local exec -T postgres pg_isready -q; then
    echo "  PostgreSQL is ready."
    break
  fi

  if [ "$i" -eq "$max_retries" ]; then
    echo "❌ PostgreSQL did not become ready in time." >&2
    exit 1
  fi

  sleep 1
done
echo "  Running database migrations..."
npx prisma migrate dev

echo "  Seeding database..."
npm run db:seed

echo "✅ Database reset complete!"
