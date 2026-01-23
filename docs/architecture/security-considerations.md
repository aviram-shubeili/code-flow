# Security Considerations

This section outlines the comprehensive security architecture for CodeFlow, covering authentication, authorization, data protection, and compliance requirements for enterprise readiness.

### Authentication & Authorization

#### OAuth 2.0 Integration (GitHub)

**Auth.js v5 Configuration:**

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GitHubProvider from 'next-auth/providers/github'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo:status pull_requests:read',
        },
      },
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async session({ session, user, token }) {
      // Add GitHub access token to session
      const account = await prisma.account.findFirst({
        where: {
          userId: user.id,
          provider: 'github',
        },
      })

      if (account?.access_token) {
        session.accessToken = account.access_token
        session.user.githubId = parseInt(account.providerAccountId)
      }

      return session
    },
    async signIn({ user, account, profile }) {
      // Create/update user profile on sign-in
      if (account?.provider === 'github' && profile) {
        await createOrUpdateUserProfile({
          userId: user.id,
          githubId: parseInt(account.providerAccountId),
          username: profile.login,
        })
      }
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}
```

**GitHub Permissions Strategy:**

- **Minimal Scope**: Only request necessary permissions
- **read:user**: Basic user profile information
- **user:email**: Access to user's email addresses
- **repo:status**: Repository status and PR information
- **No Write Access**: Read-only for MVP security

#### Session Management

**Database Sessions (Recommended for Production):**

- **Secure Storage**: Sessions stored in PostgreSQL, not JWT
- **Automatic Cleanup**: Expired sessions automatically removed
- **Token Refresh**: GitHub tokens refreshed automatically
- **Cross-Device**: Sessions work across multiple devices

**Session Security:**

```typescript
// Middleware for API route protection
export async function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      })
    }

    // Add user context to request
    req.user = session.user
    req.accessToken = session.accessToken

    return handler(req, res)
  }
}
```

### Data Protection

#### Encryption Strategy

**Data at Rest:**

- **Database**: Neon PostgreSQL with encryption enabled (AES-256)
- **Environment Variables**: Encrypted in Vercel dashboard
- **Backups**: Neon automated point-in-time recovery

**Data in Transit:**

- **HTTPS Only**: All traffic forced to HTTPS via Vercel Edge Network
- **TLS 1.2+**: Minimum TLS version enforced
- **Database Connections**: SSL/TLS required for Neon connections
- **API Calls**: GitHub API calls over HTTPS only

**Secrets Management:**

```typescript
// Environment variables from Vercel
// All secrets are stored in Vercel Dashboard → Settings → Environment Variables
// They are automatically encrypted and injected at runtime

export function getSecret(secretName: string): string {
  const value = process.env[secretName]
  if (!value) {
    throw new Error(`Missing environment variable: ${secretName}`)
  }
  return value
}

// Usage in API routes
const dbUrl = getSecret('DATABASE_URL')
const githubSecret = getSecret('GITHUB_CLIENT_SECRET')
```

#### Personal Data Handling

**Data Minimization:**

- **User Data**: Only store essential GitHub profile information
- **Repository Data**: Only monitoring preferences, no code content
- **Access Tokens**: Encrypted at rest, scope-limited, auto-refreshing

**Data Retention Policy:**

```typescript
// Automated cleanup job
export async function cleanupInactiveUsers() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  // Find inactive users
  const inactiveUsers = await prisma.userProfile.findMany({
    where: {
      lastActiveAt: {
        lt: thirtyDaysAgo,
      },
    },
    include: {
      user: {
        include: {
          sessions: true,
          accounts: true,
        },
      },
    },
  })

  // Cascade delete (Auth.js handles cleanup)
  for (const profile of inactiveUsers) {
    await prisma.user.delete({
      where: { id: profile.userId },
    })
  }
}
```

**GDPR Compliance:**

- **Right to Access**: API endpoint for user data export
- **Right to Deletion**: Complete account deletion with cascade
- **Data Portability**: JSON export of user's repository preferences
- **Privacy Policy**: Clear data usage explanation

### Network Security

#### Managed Security (Vercel + Neon)

**Network Isolation:**
Both Vercel and Neon handle network security automatically:

- **Vercel Functions**: Run in isolated containers with no shared state
- **Neon Database**: Fully managed with built-in network isolation
- **Connection Security**: All connections require SSL/TLS

**Platform Security:**

- **Vercel**: SOC 2 Type 2 compliant, automatic DDoS protection
- **Neon**: SOC 2 Type 2 compliant, encrypted connections only
- **No VPC Management**: Security handled by platform providers

```typescript
// Database connection is secured via connection string
// SSL mode is enforced by default
const databaseUrl = process.env.DATABASE_URL
// Example: postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require
```

#### API Security

**Rate Limiting:**

```typescript
// API route rate limiting
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 requests per hour
  analytics: true,
})

export async function withRateLimit(req: NextApiRequest) {
  const identifier = req.ip ?? 'anonymous'
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier)

  if (!success) {
    throw new Error('Rate limit exceeded')
  }

  return { limit, reset, remaining }
}
```

**Input Validation:**

```typescript
// Zod schema validation
import { z } from 'zod'

export const addRepositorySchema = z.object({
  githubId: z.number().positive(),
  name: z.string().min(1).max(100),
  fullName: z.string().regex(/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/),
  owner: z.string().min(1).max(50),
})

export async function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
  try {
    return schema.parse(data)
  } catch (error) {
    throw new ValidationError('Invalid input data', error.errors)
  }
}
```

**SQL Injection Prevention:**

- **Prisma ORM**: Parameterized queries by default
- **No Raw SQL**: Avoid dynamic query construction
- **Input Sanitization**: All user input validated and sanitized

### Compliance & Monitoring

#### Security Logging

**Vercel Logs & Security Events:**

```typescript
// Security event logging (captured by Vercel Logs)
export function logSecurityEvent(event: SecurityEvent) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'SECURITY',
      event: event.type,
      userId: event.userId,
      ip: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details,
      requestId: event.requestId,
    })
  )
}

// Usage in authentication
logSecurityEvent({
  type: 'AUTH_SUCCESS',
  userId: user.id,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  details: { provider: 'github' },
  requestId: req.headers['x-request-id'],
})
```

**Security Monitoring:**

- **Failed Login Attempts**: Track and alert on suspicious patterns
- **API Abuse**: Monitor for unusual request patterns
- **Database Access**: Log all database operations
- **Token Usage**: Monitor GitHub API token usage patterns

#### Incident Response

**Security Incident Playbook:**

1. **Detection**: Vercel logs monitoring for suspicious activity
2. **Containment**: Automatic session termination for compromised accounts
3. **Investigation**: Detailed logging for forensic analysis
4. **Recovery**: Database restore procedures if needed
5. **Prevention**: Update security policies based on incidents

**Automated Response:**

```typescript
// Automatic security response
export async function handleSecurityIncident(incident: SecurityIncident) {
  switch (incident.severity) {
    case 'HIGH':
      // Terminate all user sessions
      await prisma.session.deleteMany({
        where: { userId: incident.userId },
      })

      // Notify security team
      await sendSecurityAlert(incident)
      break

    case 'MEDIUM':
      // Require re-authentication
      await invalidateUserSessions(incident.userId)
      break
  }
}
```

### Security Checklist

**Pre-Deployment Security Verification:**

- [ ] **Authentication**: OAuth 2.0 properly configured
- [ ] **Authorization**: API endpoints protected with session validation
- [ ] **Encryption**: All data encrypted at rest and in transit
- [ ] **Secrets**: No hardcoded secrets in code or config
- [ ] **Input Validation**: All user inputs validated and sanitized
- [ ] **Rate Limiting**: API endpoints have appropriate rate limits
- [ ] **Logging**: Security events properly logged and monitored
- [ ] **Network**: Database isolated in private subnets
- [ ] **Dependencies**: All packages scanned for vulnerabilities
- [ ] **Compliance**: GDPR requirements implemented

**Ongoing Security Maintenance:**

- **Monthly**: Dependency vulnerability scanning
- **Quarterly**: Access review and cleanup
- **Annually**: Penetration testing and security audit
- **Continuous**: Security monitoring and incident response

This security architecture leverages the built-in security features of Vercel and Neon, providing strong security without the overhead of managing infrastructure. Both platforms are SOC 2 Type 2 compliant and handle network security, encryption, and compliance automatically.

**Note on Scaling:** If CodeFlow grows to require enterprise-grade security controls (custom VPCs, AWS PrivateLink, etc.), the application can be migrated to AWS with dedicated infrastructure.
