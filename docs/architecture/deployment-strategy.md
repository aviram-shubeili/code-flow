# Deployment Strategy

This section defines the AWS serverless deployment architecture for CodeFlow using AWS CDK (Cloud Development Kit) with TypeScript. The deployment strategy emphasizes cost optimization, automatic scaling, and enterprise readiness.

### AWS Infrastructure Architecture

**Target Architecture:** Serverless-first with AWS Lambda, RDS PostgreSQL, and CloudFront CDN for optimal cost/performance balance during MVP phase.

```mermaid
graph TB
    subgraph "AWS Account - US-East-1"
        subgraph "CDN & Static Assets"
            CF[CloudFront Distribution]
            S3[S3 Bucket - Static Assets]
        end
        
        subgraph "Compute Layer"
            LAMBDA[Lambda Functions]
            APIGW[API Gateway v2]
        end
        
        subgraph "Data Layer"  
            RDS[(RDS PostgreSQL)]
            RDSSUBNET[Private Subnets]
        end
        
        subgraph "Security Layer"
            VPC[VPC]
            SECGROUP[Security Groups]
            IAM[IAM Roles]
        end
        
        subgraph "Monitoring"
            CW[CloudWatch]
            XRAY[X-Ray Tracing]
        end
    end
    
    subgraph "External Services"
        GITHUB[GitHub OAuth & API]
        DOMAIN[Custom Domain]
    end
    
    DOMAIN --> CF
    CF --> S3
    CF --> APIGW
    APIGW --> LAMBDA
    LAMBDA --> RDS
    RDS --> RDSSUBNET
    LAMBDA --> GITHUB
    LAMBDA --> CW
    
    classDef aws fill:#ff9900,stroke:#232f3e,color:#fff
    classDef external fill:#4285f4,stroke:#1a73e8,color:#fff
    
    class CF,S3,LAMBDA,APIGW,RDS,VPC,SECGROUP,IAM,CW,XRAY aws
    class GITHUB,DOMAIN external
```

### AWS CDK Stack Definition

**File:** `infrastructure/lib/codeflow-stack.ts`

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';

export class CodeFlowStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ========================================================================
    // Network Infrastructure
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

    // ========================================================================
    // Database Layer
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

    // ========================================================================
    // Lambda Functions
    // ========================================================================
    
    const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSG', {
      vpc,
      description: 'Security group for Lambda functions',
    });

    // Allow Lambda to connect to RDS
    databaseSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      ec2.Port.tcp(5432),
      'Lambda to RDS connection'
    );

    // Next.js Lambda Function
    const nextjsFunction = new lambda.Function(this, 'NextJSFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('dist'), // Built Next.js application
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
      environment: {
        DATABASE_URL: database.instanceEndpoint.socketAddress,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'development-secret',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://app.codeflow.dev',
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID!,
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET!,
      },
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [lambdaSecurityGroup],
    });

    // Grant RDS access to Lambda
    database.secret?.grantRead(nextjsFunction);

    // ========================================================================
    // Static Assets (S3 + CloudFront)
    // ========================================================================
    
    const assetsBucket = new s3.Bucket(this, 'CodeFlowAssets', {
      bucketName: `codeflow-assets-${this.account}-${this.region}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [{
        enabled: true,
        expiration: cdk.Duration.days(365),
        transitions: [{
          storageClass: s3.StorageClass.INFREQUENT_ACCESS,
          transitionAfter: cdk.Duration.days(30),
        }],
      }],
    });

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'CodeFlowCDN', {
      defaultBehavior: {
        origin: new origins.S3Origin(assetsBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.HttpOrigin(`${nextjsFunction.functionArn}.lambda-url.${this.region}.on.aws`),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED, // API routes should not be cached
        },
        '/_next/*': {
          origin: new origins.S3Origin(assetsBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED_FOR_UNCOMPRESSED_OBJECTS,
        },
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Cost optimization
      enableIpv6: true,
      comment: 'CodeFlow CDN Distribution',
    });

    // ========================================================================
    // Domain & SSL Certificate
    // ========================================================================
    
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'codeflow.dev',
    });

    const certificate = new certificatemanager.Certificate(this, 'CodeFlowCertificate', {
      domainName: 'app.codeflow.dev',
      subjectAlternativeNames: ['*.codeflow.dev'],
      validation: certificatemanager.CertificateValidation.fromDns(hostedZone),
    });

    // Route53 Alias Record
    new route53.ARecord(this, 'CodeFlowDomain', {
      zone: hostedZone,
      recordName: 'app',
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution)
      ),
    });

    // ========================================================================
    // Monitoring & Logging
    // ========================================================================
    
    // CloudWatch Log Groups
    const logGroup = new logs.LogGroup(this, 'CodeFlowLogs', {
      logGroupName: '/aws/lambda/codeflow',
      retention: logs.RetentionDays.ONE_MONTH, // Cost optimization
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // CloudWatch Dashboard
    const dashboard = new cloudwatch.Dashboard(this, 'CodeFlowDashboard', {
      dashboardName: 'CodeFlow-Monitoring',
    });

    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Lambda Invocations',
        left: [nextjsFunction.metricInvocations()],
      }),
      new cloudwatch.GraphWidget({
        title: 'Lambda Errors', 
        left: [nextjsFunction.metricErrors()],
      }),
      new cloudwatch.GraphWidget({
        title: 'Database Connections',
        left: [database.metricDatabaseConnections()],
      }),
    );

    // ========================================================================
    // Outputs
    // ========================================================================
    
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.instanceEndpoint.hostname,
      description: 'RDS PostgreSQL endpoint',
    });

    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: distribution.domainName,
      description: 'CloudFront distribution URL',
    });

    new cdk.CfnOutput(this, 'CustomDomainURL', {
      value: 'https://app.codeflow.dev',
      description: 'Custom domain URL',
    });
  }
}
```

### Deployment Pipeline (GitHub Actions)

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy CodeFlow

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  NODE_VERSION: 18

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          NEXTAUTH_SECRET: test-secret
          GITHUB_CLIENT_ID: test-id
          GITHUB_CLIENT_SECRET: test-secret

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Next.js application
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          GITHUB_CLIENT_ID: ${{ secrets.GITHUB_CLIENT_ID }}
          GITHUB_CLIENT_SECRET: ${{ secrets.GITHUB_CLIENT_SECRET }}
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: nextjs-build
          path: |
            .next/
            dist/
            package.json

  deploy-staging:
    if: github.event_name == 'pull_request'
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v3
        with:
          name: nextjs-build
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Deploy to staging
        run: |
          npm ci
          npm run cdk:deploy -- --all --require-approval never
        env:
          ENVIRONMENT: staging

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v3
        with:
          name: nextjs-build
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Deploy to production
        run: |
          npm ci  
          npm run cdk:deploy -- --all --require-approval never
        env:
          ENVIRONMENT: production
```

### Cost Optimization Strategy

**AWS Free Tier Utilization:**
- **Lambda**: 1M requests/month, 400K GB-seconds compute time
- **RDS**: t3.micro instance (750 hours/month), 20GB storage
- **CloudFront**: 1TB data transfer out, 10M HTTP/HTTPS requests
- **S3**: 5GB storage, 20K GET requests, 2K PUT requests

**Estimated Monthly Costs (After Free Tier):**
- **Lambda**: ~$1-5 (based on usage patterns)
- **RDS**: ~$15-25 (t3.micro + storage)
- **CloudFront**: ~$1-3 (data transfer)
- **S3**: ~$1-2 (static assets)
- **Route53**: ~$0.50 (hosted zone)
- **Total**: ~$18-35/month for MVP phase

**Scaling Thresholds:**
- **50+ Users**: Upgrade RDS to t3.small
- **100+ Users**: Add read replicas
- **500+ Users**: Consider Aurora Serverless v2
- **1000+ Users**: Multi-AZ deployment, dedicated NAT Gateway

### Environment Management

**Development Environment:**
```bash
# Local development with Docker Compose
docker-compose up -d postgres
npm run dev
```

**Staging Environment:**
- **Isolated AWS Account**: Separate staging environment
- **Database**: Smaller RDS instance (t3.micro)
- **Domain**: staging.codeflow.dev
- **Auto-deploy**: On pull requests

**Production Environment:**
- **Production AWS Account**: Isolated from staging  
- **Database**: Production RDS with backups
- **Domain**: app.codeflow.dev
- **Manual approval**: Required for deployments

This deployment strategy provides a robust, scalable, and cost-effective foundation for the MVP while maintaining clear upgrade paths for growth.
