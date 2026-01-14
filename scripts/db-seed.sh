#!/bin/bash
# Database Seed Script for Local Development
# Seeds the database with development data

set -e

echo "🌱 Seeding database..."

tsx prisma/seed.ts

echo "✅ Database seeded successfully!"
