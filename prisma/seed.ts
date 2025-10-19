import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log('🌱 Starting database seeding...')

  try {
    // Clean existing seed data (development only)
    console.log('🧹 Cleaning existing seed data...')
    await prisma.account.deleteMany({
      where: {
        user: {
          email: {
            in: ['dev@codeflow.local', 'test@codeflow.local'],
          },
        },
      },
    })

    await prisma.session.deleteMany({
      where: {
        user: {
          email: {
            in: ['dev@codeflow.local', 'test@codeflow.local'],
          },
        },
      },
    })

    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['dev@codeflow.local', 'test@codeflow.local'],
        },
      },
    })

    // Create test users
    console.log('👥 Creating test users...')
    const devUser = await prisma.user.create({
      data: {
        id: 'dev-user-id',
        name: 'Development User',
        email: 'dev@codeflow.local',
        image: 'https://github.com/identicons/dev-user.png',
        emailVerified: new Date(),
      },
    })

    const testUser = await prisma.user.create({
      data: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@codeflow.local',
        image: 'https://github.com/identicons/test-user.png',
        emailVerified: new Date(),
      },
    })

    // Create GitHub accounts for test users
    console.log('🔗 Creating GitHub accounts...')
    await prisma.account.createMany({
      data: [
        {
          userId: devUser.id,
          type: 'oauth',
          provider: 'github',
          providerAccountId: '12345',
          access_token: 'dev_access_token_placeholder',
          refresh_token: 'dev_refresh_token_placeholder',
          token_type: 'bearer',
          scope: 'repo,user:email',
        },
        {
          userId: testUser.id,
          type: 'oauth',
          provider: 'github',
          providerAccountId: '67890',
          access_token: 'test_access_token_placeholder',
          refresh_token: 'test_refresh_token_placeholder',
          token_type: 'bearer',
          scope: 'repo,user:email',
        },
      ],
    })



    // Create sample sessions (for testing session management)
    console.log('🔐 Creating sample sessions...')
    await prisma.session.createMany({
      data: [
        {
          userId: devUser.id,
          sessionToken: 'dev_session_token_' + Date.now(),
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
        },
        {
          userId: testUser.id,
          sessionToken: 'test_session_token_' + Date.now(),
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
        },
      ],
    })

    console.log('✅ Database seeding completed successfully!')
    console.log(`
📊 Seed Data Summary:
  - Users: 2
  - GitHub Accounts: 2  
  - Sessions: 2

🧪 Test Data Available:
  - Dev User: dev@codeflow.local (GitHub: codeflow-dev-user)
  - Test User: test@codeflow.local (GitHub: codeflow-test-user)
  - OAuth accounts configured for GitHub integration
  - Active sessions for authentication testing
`)
  } catch (error) {
    console.error('❌ Error during database seeding:', error)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })