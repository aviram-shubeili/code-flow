# Deployment Strategy

This section defines the AWS serverless deployment architecture for CodeFlow using **AWS Amplify Gen 2** with TypeScript-first infrastructure-as-code. Amplify Gen 2 is built on AWS CDK, providing the best of both worlds: the infrastructure control and flexibility of CDK with the developer experience and automation of Amplify. The deployment strategy emphasizes cost optimization, automatic scaling, enterprise readiness, and enhanced developer productivity.

### AWS Infrastructure Architecture

**Target Architecture:** Amplify Gen 2 serverless-first with TypeScript infrastructure, AWS Lambda, RDS PostgreSQL, and managed hosting for optimal cost/performance balance during MVP phase. Infrastructure defined in TypeScript using CDK constructs within Amplify's framework.

```mermaid
graph TB
    subgraph "AWS Account - US-East-1"
        subgraph "Amplify Gen 2 Platform"
            AMPLIFY[Amplify Hosting]
            CONSOLE[Amplify Console]
        end
        
        subgraph "Compute Layer"
            LAMBDA[Lambda Functions]
            NEXTJS[Next.js SSR]
        end
        
        subgraph "Custom Infrastructure (CDK)"
            RDS[(RDS PostgreSQL)]
            VPC[VPC]
            SECGROUP[Security Groups]
        end
        
        subgraph "Managed Services"
            AUTH[Amplify Auth]
            DEPLOY[Git-based Deploy]
        end
        
        subgraph "Monitoring"
            CW[CloudWatch]
            CONSOLE_MON[Amplify Monitoring]
        end
    end
    
    subgraph "External Services"
        GITHUB[GitHub OAuth & API]
        DOMAIN[Custom Domain]
        REPO[Git Repository]
    end
    
    subgraph "Developer Experience"
        SANDBOX[Per-Dev Sandboxes]
        BRANCH[Branch Environments]
    end
    
    REPO --> DEPLOY
    DEPLOY --> AMPLIFY
    AMPLIFY --> NEXTJS
    AMPLIFY --> LAMBDA
    LAMBDA --> RDS
    RDS --> VPC
    AUTH --> GITHUB
    DOMAIN --> AMPLIFY
    DEPLOY --> SANDBOX
    DEPLOY --> BRANCH
    
    classDef amplify fill:#ff6600,stroke:#232f3e,color:#fff
    classDef aws fill:#ff9900,stroke:#232f3e,color:#fff
    classDef external fill:#4285f4,stroke:#1a73e8,color:#fff
    classDef dev fill:#00cc66,stroke:#232f3e,color:#fff
    
    class AMPLIFY,AUTH,DEPLOY,CONSOLE,CONSOLE_MON amplify
    class LAMBDA,NEXTJS,RDS,VPC,SECGROUP,CW aws
    class GITHUB,DOMAIN,REPO external
    class SANDBOX,BRANCH dev
```

### Amplify Gen 2 Backend Configuration

**File:** `amplify/backend.ts` (Main backend definition)

```typescript
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { CodeFlowInfrastructure } from './custom/infrastructure/resource';

const backend = defineBackend({
  auth,
  data
});

// Add custom infrastructure using CDK
const customInfrastructure = new CodeFlowInfrastructure(
  backend.createStack('CodeFlowInfrastructure'),
  'CodeFlowInfrastructure'
);

// Export infrastructure outputs for frontend
backend.addOutput({
  custom: {
    DATABASE_URL: customInfrastructure.databaseUrl,
    VPC_ID: customInfrastructure.vpcId,
  }
});
```

**File:** `amplify/auth/resource.ts` (Authentication configuration)

```typescript
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    externalProviders: {
      github: {
        clientId: secret('GITHUB_CLIENT_ID'),
        clientSecret: secret('GITHUB_CLIENT_SECRET'),
      }
    }
  }
});
```

**File:** `amplify/custom/infrastructure/resource.ts` (CDK Infrastructure)

```typescript
import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

export class CodeFlowInfrastructure extends Construct {
  public readonly databaseUrl: string;
  public readonly vpcId: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // ========================================================================
    // Network Infrastructure (Same as before - CDK constructs work directly)
    // ========================================================================
    
    const vpc = new ec2.Vpc(this, 'CodeFlowVPC', {
      maxAzs: 2,
      natGateways: 0, // Cost optimization - use NAT instances if needed
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,  
          name: 'PrivateSubnet',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
    
    this.vpcId = vpc.vpcId;

    // ========================================================================
    // Database Layer (Same RDS configuration - optimized for CodeFlow)
    // ========================================================================
    
    const databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSG', {
      vpc,
      description: 'Security group for RDS PostgreSQL',
    });

    const database = new rds.DatabaseInstance(this, 'CodeFlowDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO), // Free tier eligible
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [databaseSecurityGroup],
      databaseName: 'codeflow',
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      backupRetention: cdk.Duration.days(7),
      deletionProtection: true,
      storageEncrypted: true,
      multiAz: false, // Cost optimization for MVP
      allocatedStorage: 20, // GB - Free tier eligible
      maxAllocatedStorage: 100, // Auto-scaling limit
    });
    
    this.databaseUrl = database.instanceEndpoint.socketAddress;

    // ========================================================================
    // Lambda Security Configuration (for Amplify functions to access RDS)
    // ========================================================================
    
    const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSG', {
      vpc,
      description: 'Security group for Amplify Lambda functions',
    });

    // Allow Amplify Lambda functions to connect to RDS
    databaseSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      ec2.Port.tcp(5432),
      'Amplify Lambda to RDS connection'
    );

    // Note: Amplify Gen 2 manages the Next.js deployment automatically
    // The Lambda functions are created by Amplify based on your Next.js app
    // We just configure the security groups and database access

    // ========================================================================
    // Note: Static Assets & CDN (Managed by Amplify)
    // ========================================================================
    // Amplify Gen 2 automatically handles:
    // - S3 bucket creation for static assets
    // - CloudFront distribution configuration
    // - SSL certificate management
    // - Optimal caching strategies for Next.js
    // - Image optimization
    // You can still customize these through Amplify configuration if needed

    // ========================================================================
    // Domain & SSL Certificate (Managed by Amplify + Custom Route53)
    // ========================================================================
    // Note: Amplify Gen 2 handles SSL certificates automatically
    // Custom domain configuration is done through Amplify Console
    // or amplify.yml configuration file
    
    // Optional: Custom Route53 setup if you need additional DNS records
    // const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
    //   domainName: 'codeflow.dev',
    // });

    // ========================================================================
    // Enhanced Monitoring (Amplify + Custom CloudWatch)
    // ========================================================================
    
    // Custom CloudWatch Dashboard for infrastructure monitoring
    const dashboard = new cloudwatch.Dashboard(this, 'CodeFlowInfrastructureDashboard', {
      dashboardName: 'CodeFlow-Infrastructure-Monitoring',
    });

    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Database Connections',
        left: [database.metricDatabaseConnections()],
      }),
      new cloudwatch.GraphWidget({
        title: 'Database CPU Utilization',
        left: [database.metricCPUUtilization()],
      }),
      new cloudwatch.GraphWidget({
        title: 'VPC Flow Logs',
        left: [], // Add VPC metrics as needed
      }),
    );
    
    // Note: Amplify Gen 2 provides built-in monitoring for:
    // - Lambda function metrics and errors
    // - Frontend performance metrics
    // - Build and deployment metrics
    // - User authentication metrics
    // Accessible through the Amplify Console

    // ========================================================================
    // Infrastructure Outputs
    // ========================================================================
    
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.instanceEndpoint.hostname,
      description: 'RDS PostgreSQL endpoint',
    });
    
    new cdk.CfnOutput(this, 'VPCId', {
      value: vpc.vpcId,
      description: 'VPC ID for Amplify function configuration',
    });
    
    new cdk.CfnOutput(this, 'DatabaseSecurityGroupId', {
      value: databaseSecurityGroup.securityGroupId,
      description: 'Database security group ID',
    });
  }
}
```

**File:** `amplify/data/resource.ts` (Optional: If using Amplify's managed data)

```typescript
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

// Example schema if you want to use Amplify's managed DynamoDB
// alongside your PostgreSQL database
const schema = a.schema({
  UserPreferences: a
    .model({
      userId: a.string().required(),
      theme: a.string(),
      notifications: a.boolean(),
    })
    .authorization((allow) => allow.owner()),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
});
```

### Amplify Gen 2 Deployment Pipeline

**File:** `amplify.yml` (Amplify build configuration)

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - npm ci
        - npx amplify backend build

frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

**File:** `.github/workflows/quality-gates.yml` (Simplified Quality Gates)

```yaml
name: Quality Gates for Amplify Deployment

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: 18

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type checking
        run: npm run type-check
      
      - name: Linting
        run: npm run lint
      
      - name: Run tests
        run: npm run test
      
      - name: Build validation
        run: npm run build
        env:
          # Using dummy values for build validation
          DATABASE_URL: postgresql://dummy:dummy@localhost:5432/dummy
          NEXTAUTH_SECRET: validation-secret
          GITHUB_CLIENT_ID: validation-id
          GITHUB_CLIENT_SECRET: validation-secret
      
      - name: Run E2E tests (if PR)
        if: github.event_name == 'pull_request'
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          NEXTAUTH_SECRET: test-secret
          GITHUB_CLIENT_ID: test-id
          GITHUB_CLIENT_SECRET: test-secret

  # Database migrations (only for production)
  migrate-database:
    if: github.ref == 'refs/heads/main'
    needs: quality-gates
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

**Note:** With Amplify Gen 2, the traditional CI/CD pipeline is greatly simplified:

- **Story 0.7 (Amplify Infrastructure)**: Sets up automatic Git-based deployment
- **Story 0.3 (Quality Gates)**: Adds testing and database migration automation  
- **Amplify handles**: Build process, deployment, environment management, rollbacks

When you push to connected branches:

- **Main branch** → Quality gates run → Database migrations → Automatic production deployment
- **Staging branch** → Quality gates run → Automatic staging deployment  
- **Feature branches** → Quality gates run → Automatic preview environments
- **Pull requests** → Quality gates run → Automatic preview environments

This approach provides better developer experience with less maintenance overhead than traditional CI/CD pipelines.

### Per-Developer Sandbox Setup

**Local Development Commands:**

```bash
# Initialize Amplify Gen 2 project
npx create-amplify@latest

# Start local development with cloud sandbox
npx amplify sandbox

# Deploy your personal cloud sandbox
npx amplify sandbox --profile [your-profile]

# View sandbox resources
npx amplify sandbox status

# Delete sandbox when done
npx amplify sandbox delete
```

**Benefits of Sandbox Environments:**
- Each developer gets isolated cloud resources
- Test with real AWS services (RDS, Lambda, etc.)
- No conflicts between team members
- 8x faster deployment than traditional approaches
- Automatic cleanup when switching branches

### Cost Optimization Strategy with Amplify Gen 2

**AWS Free Tier Utilization:**
- **Amplify Hosting**: Free tier includes 1,000 build minutes/month, 5GB storage, 15GB served/month
- **Lambda**: 1M requests/month, 400K GB-seconds compute time (managed by Amplify)
- **RDS**: t3.micro instance (750 hours/month), 20GB storage (custom infrastructure)
- **S3**: 5GB storage, 20K GET requests, 2K PUT requests (managed by Amplify)

**Estimated Monthly Costs (After Free Tier):**

| Service | Current CDK | Amplify Gen 2 | Difference |
|---------|-------------|---------------|------------|
| **Hosting/CDN** | CloudFront: $1-3 | Amplify Hosting: $6-12 | +$5-9 |
| **Build & Deploy** | GitHub Actions: $0 | Amplify Build: $6-10 | +$6-10 |
| **Lambda Functions** | Manual: $1-5 | Managed: $3-8 | +$2-3 |
| **RDS PostgreSQL** | $15-25 | $15-25 (unchanged) | $0 |
| **Route53** | $0.50 | $0.50 (unchanged) | $0 |
| **Developer Productivity** | - | Sandbox value: -$50/dev | -$200-400 |
| **Total Infrastructure** | $18-35/month | $30-55/month | +$12-20 |
| **Total Value (4 devs)** | $18-35/month | **Net: -$170-345/month** | **💰 SAVINGS** |

**Value Analysis:**
- **Infrastructure Cost Increase**: ~50-80% (+$12-20/month)
- **Developer Productivity Savings**: 8x faster deployments, per-dev sandboxes
- **Operational Cost Reduction**: Less DevOps maintenance, automatic scaling
- **Time-to-Market**: Faster feature delivery, better developer experience

**Scaling Thresholds:**
- **50+ Users**: Amplify automatically optimizes; upgrade RDS to t3.small
- **100+ Users**: Consider Aurora Serverless v2 for database
- **500+ Users**: Amplify handles frontend scaling; add RDS read replicas
- **1000+ Users**: Multi-AZ deployment, dedicated database scaling

**Cost Optimization Tips:**
1. **Use Amplify's build optimizations** (automatic caching, incremental builds)
2. **Leverage branch-based environments** (automatic cleanup of unused environments)
3. **Monitor through Amplify Console** (built-in cost tracking and optimization suggestions)
4. **Optimize RDS usage** (same strategies as before - right-sizing, connection pooling)

### Environment Management with Amplify Gen 2

**Development Environment (Per-Developer Sandboxes):**
```bash
# Each developer gets isolated cloud environment
npx amplify sandbox

# Includes:
# - Individual Lambda functions
# - Separate database instance (for testing)
# - Isolated authentication
# - Personal domain/endpoint
# - Real AWS services for high-fidelity testing
```

**Staging Environment (Git Branch: `staging`):**
- **Automatic Deployment**: Push to staging branch triggers deployment
- **Database**: Shared staging RDS instance (t3.micro)
- **Domain**: staging.codeflow.dev (managed by Amplify)
- **Environment Variables**: Configured in Amplify Console
- **Team Access**: Shared environment for integration testing

**Production Environment (Git Branch: `main`):**
- **Automatic Deployment**: Push to main branch triggers production deployment
- **Database**: Production RDS with backups and monitoring
- **Domain**: app.codeflow.dev (managed by Amplify)
- **Environment Variables**: Production secrets managed in Amplify Console
- **Manual Approval**: Can be configured for critical production deployments

**Feature Branch Environments:**
```bash
# Automatic preview environments for feature branches
git checkout -b feature/new-dashboard
git push origin feature/new-dashboard

# Amplify automatically creates:
# - Temporary preview environment
# - Unique URL: https://feature-new-dashboard.d1234567890.amplifyapp.com
# - Isolated backend resources
# - Automatic cleanup when branch is deleted
```

**Environment Configuration Management:**

**File:** `amplify/backend.ts` (Environment-specific configuration)

```typescript
import { defineBackend } from '@aws-amplify/backend';

const backend = defineBackend({
  auth,
  data
});

// Environment-specific infrastructure
const environment = process.env.AMPLIFY_BRANCH || 'sandbox';

if (environment === 'main') {
  // Production-specific resources
  const prodInfrastructure = new CodeFlowInfrastructure(
    backend.createStack('ProdInfrastructure'),
    'ProdInfrastructure',
    {
      instanceSize: 'SMALL', // Larger RDS instance
      multiAz: true,
      backupRetention: 30,
    }
  );
} else if (environment === 'staging') {
  // Staging-specific resources
  const stagingInfrastructure = new CodeFlowInfrastructure(
    backend.createStack('StagingInfrastructure'),
    'StagingInfrastructure',
    {
      instanceSize: 'MICRO',
      multiAz: false,
      backupRetention: 7,
    }
  );
} else {
  // Sandbox/development resources
  const devInfrastructure = new CodeFlowInfrastructure(
    backend.createStack('DevInfrastructure'),
    'DevInfrastructure',
    {
      instanceSize: 'MICRO',
      multiAz: false,
      backupRetention: 1,
    }
  );
}
```

**Key Advantages of Amplify Gen 2 Environment Management:**

1. **Zero-Config Branch Deployment**: Each Git branch automatically becomes an environment
2. **Per-Developer Isolation**: No conflicts between team members during development
3. **Automatic Resource Cleanup**: Unused environments are automatically cleaned up
4. **Environment Parity**: Same infrastructure code runs in all environments
5. **Secrets Management**: Built-in secure environment variable management
6. **Preview URLs**: Automatic preview URLs for feature branches and pull requests

This deployment strategy leverages **AWS Amplify Gen 2's TypeScript-first approach** to provide the infrastructure control and flexibility of CDK with the developer experience and automation of a modern platform. The approach maintains all your existing infrastructure optimizations while dramatically improving developer productivity and deployment speed.

### Features-First Development Timeline

**Sprint 1 (Weeks 1-2): Application Foundation**
- Next.js application with GitHub integration (US0.1, US1.1, US1.2)
- Basic PR data retrieval using local development environment (US2.1)
- 20% time allocation for infrastructure platform prototyping

**Sprint 2 (Weeks 3-4): Core Features & UI**  
- Dashboard UI with full PR analysis (Epic 3 stories)
- Performance optimization and data resilience (US2.3, US2.4)
- Infrastructure requirements documentation based on real usage

**Sprint 3 (Weeks 5-6): Infrastructure Deployment**
- Infrastructure platform decision based on Sprint 1-2 learnings
- Amplify Gen 2 deployment with optimized configuration (US0.7)
- Quality gates and migration automation (US0.3)

## Do We Still Need AWS CDK?

**Yes, but in a better way!** AWS Amplify Gen 2 IS built on AWS CDK. Here's how:

### CDK Integration in Amplify Gen 2

1. **Full CDK Access**: You can use any CDK construct within Amplify backend definitions
2. **TypeScript-First**: Write infrastructure in TypeScript, same as pure CDK
3. **Enhanced DX**: Get Amplify's deployment automation + CDK's flexibility
4. **No Lock-in**: Your CDK code is portable and can be extracted if needed

### What Changes vs. Pure CDK

| Aspect | Pure CDK | Amplify Gen 2 + CDK |
|--------|----------|---------------------|
| **Infrastructure** | Manual CDK stacks | CDK constructs in Amplify backend |
| **Deployment** | Manual CDK deploy | Git-based automatic deployment |
| **Environments** | Manual setup | Automatic branch-based environments |
| **Frontend Hosting** | Manual S3+CloudFront | Automatic optimized hosting |
| **Developer Experience** | Build → Deploy → Test | Push → Auto-deploy → Per-dev sandboxes |

### Migration Benefits

- **Keep your RDS setup**: Same CDK constructs, same configuration
- **Keep your VPC design**: Same networking, same security
- **Keep your monitoring**: Same CloudWatch setup + Amplify monitoring
- **Gain automation**: Git-based deployments, automatic environments
- **Gain productivity**: Per-developer sandboxes, 8x faster iterations

### The Best of Both Worlds

Amplify Gen 2 gives you:
✅ **CDK's power and flexibility** (any AWS service, full control)  
✅ **Amplify's automation and DX** (Git deployments, sandboxes, monitoring)  
✅ **Enterprise readiness** (same infrastructure patterns you designed)  
✅ **Developer productivity** (faster iterations, better collaboration)

**Bottom Line**: You're not replacing CDK—you're enhancing it with Amplify's deployment automation and developer experience improvements while maintaining all the infrastructure control you need.

