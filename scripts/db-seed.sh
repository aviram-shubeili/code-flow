#!/bin/bash
# Database seeding script for CodeFlow development
# Seeds the database with development test data

set -e

echo "🌱 Seeding CodeFlow development database..."

# Check if database is running
if ! docker-compose exec -T postgres pg_isready -U codeflow -d codeflow_dev > /dev/null 2>&1; then
    echo "❌ Error: PostgreSQL database is not running or not ready."
    echo "💡 Try running: npm run db:up"
    exit 1
fi

# Run Prisma seed script
echo "📝 Running Prisma seed script..."
npm run db:seed

echo "✅ Database seeding completed!"
echo ""
echo "🧪 Test data available:"
echo "  • Dev User: dev@codeflow.local (GitHub OAuth ready)"
echo "  • Test User: test@codeflow.local (GitHub OAuth ready)"
echo "  • Auth.js foundation data for authentication testing"
echo ""
echo "🔍 Explore data:"
echo "  • Prisma Studio: npm run db:studio"
echo "  • Database logs: npm run db:logs"