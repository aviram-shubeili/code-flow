/**
 * Database Seed Script
 * 
 * Creates development data for local testing
 * Run with: npm run db:seed
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'
import pg from 'pg'

const { Pool } = pg

// Load environment variables
config({ path: '.env.local' })

// Create connection pool and adapter for Prisma 7
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding development database...')

  // Clean existing data before seeding
  console.log('  Cleaning existing data...')
  await prisma.repository.deleteMany()
  await prisma.userProfile.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Create test user
  console.log('  Creating test user...')
  const testUser = await prisma.user.create({
    data: {
      id: 'test-user-1',
      email: 'dev@codeflow.dev',
      name: 'Development User',
      image: 'https://avatars.githubusercontent.com/u/1?v=4',
      emailVerified: new Date(),
    },
  })

  // Create GitHub account for test user
  console.log('  Creating GitHub account...')
  await prisma.account.create({
    data: {
      userId: testUser.id,
      type: 'oauth',
      provider: 'github',
      providerAccountId: '123456789',
      access_token: 'test_github_token',
      token_type: 'bearer',
      scope: 'read:user,repo',
    },
  })

  // Create user profile
  console.log('  Creating user profile...')
  const userProfile = await prisma.userProfile.create({
    data: {
      userId: testUser.id,
      githubId: 123456789,
      username: 'dev-user',
      lastActiveAt: new Date(),
    },
  })

  // Create test repositories
  console.log('  Creating test repositories...')
  await prisma.repository.createMany({
    data: [
      {
        userId: userProfile.id,
        githubId: 1001,
        name: 'codeflow',
        fullName: 'dev-org/codeflow',
        owner: 'dev-org',
        isActive: true,
      },
      {
        userId: userProfile.id,
        githubId: 1002,
        name: 'test-repo',
        fullName: 'dev-org/test-repo',
        owner: 'dev-org',
        isActive: true,
      },
      {
        userId: userProfile.id,
        githubId: 1003,
        name: 'archived-repo',
        fullName: 'dev-org/archived-repo',
        owner: 'dev-org',
        isActive: false,
      },
    ],
  })

  // Create second test user for multi-user scenarios
  console.log('  Creating second test user...')
  const testUser2 = await prisma.user.create({
    data: {
      id: 'test-user-2',
      email: 'dev2@codeflow.dev',
      name: 'Development User 2',
      image: 'https://avatars.githubusercontent.com/u/2?v=4',
    },
  })

  await prisma.account.create({
    data: {
      userId: testUser2.id,
      type: 'oauth',
      provider: 'github',
      providerAccountId: '987654321',
      access_token: 'test_github_token_2',
      token_type: 'bearer',
      scope: 'read:user,repo',
    },
  })

  await prisma.userProfile.create({
    data: {
      userId: testUser2.id,
      githubId: 987654321,
      username: 'dev-user-2',
      lastActiveAt: new Date(),
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('')
  console.log('📊 Created:')
  console.log('  - 2 test users')
  console.log('  - 2 GitHub accounts')
  console.log('  - 2 user profiles')
  console.log('  - 3 repositories (2 active, 1 inactive)')
  console.log('')
  console.log('🔑 Test credentials:')
  console.log('  Email: dev@codeflow.dev')
  console.log('  GitHub ID: 123456789')
}

main()
  .catch((e) => {
    console.error('❌ Database seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
