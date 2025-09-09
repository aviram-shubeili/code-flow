# Monitoring and Observability

This section defines the monitoring stack and observability strategy for CodeFlow's production deployment on AWS.

### Monitoring Architecture

#### CloudWatch Integration

**Log Aggregation Strategy:**
```typescript
// lib/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'codeflow',
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
  },
  transports: [
    // Console logging for development
    ...(process.env.NODE_ENV === 'development' 
      ? [new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })]
      : []
    ),
    
    // CloudWatch logging for production
    ...(process.env.NODE_ENV === 'production'
      ? [new winston.transports.Console({
          format: winston.format.json()
        })]
      : []
    ),
  ],
})

export { logger }

// Usage in API routes
export function logApiRequest(req: NextRequest, response: { status: number }, duration: number) {
  logger.info('API Request', {
    method: req.method,
    url: req.url,
    status: response.status,
    duration,
    userAgent: req.headers.get('user-agent'),
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
  })
}

export function logApiError(error: unknown, context: Record<string, any>) {
  logger.error('API Error', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  })
}
```

#### Key Metrics Collection

**Application Metrics:**
```typescript
// lib/metrics.ts
interface Metric {
  name: string
  value: number
  unit: 'Count' | 'Milliseconds' | 'Percent' | 'Bytes'
  dimensions?: Record<string, string>
}

export class MetricsCollector {
  private metrics: Metric[] = []

  addMetric(metric: Metric) {
    this.metrics.push({
      ...metric,
      dimensions: {
        Environment: process.env.NODE_ENV || 'unknown',
        ...metric.dimensions,
      },
    })
  }

  async flush() {
    if (this.metrics.length === 0) return

    // In production, send to CloudWatch
    if (process.env.NODE_ENV === 'production') {
      try {
        // CloudWatch metrics would be sent here
        console.log('CloudWatch Metrics:', JSON.stringify(this.metrics, null, 2))
      } catch (error) {
        console.error('Failed to send metrics:', error)
      }
    }

    this.metrics = []
  }

  // Convenience methods
  incrementCounter(name: string, dimensions?: Record<string, string>) {
    this.addMetric({ name, value: 1, unit: 'Count', dimensions })
  }

  recordDuration(name: string, duration: number, dimensions?: Record<string, string>) {
    this.addMetric({ name, value: duration, unit: 'Milliseconds', dimensions })
  }

  recordGauge(name: string, value: number, unit: Metric['unit'], dimensions?: Record<string, string>) {
    this.addMetric({ name, value, unit, dimensions })
  }
}

export const metrics = new MetricsCollector()

// Usage in API routes
export function withMetrics<T>(
  operation: string,
  handler: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()
  
  return handler()
    .then((result) => {
      metrics.recordDuration(`${operation}.Duration`, Date.now() - startTime)
      metrics.incrementCounter(`${operation}.Success`)
      return result
    })
    .catch((error) => {
      metrics.recordDuration(`${operation}.Duration`, Date.now() - startTime)
      metrics.incrementCounter(`${operation}.Error`, {
        ErrorType: error.constructor.name,
      })
      throw error
    })
    .finally(() => {
      metrics.flush()
    })
}
```

#### Dashboard and Alerting

**CloudWatch Dashboard Configuration:**
```typescript
// infrastructure/lib/monitoring-stack.ts
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch'
import * as lambda from 'aws-cdk-lib/aws-lambda'

export class MonitoringStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props)

    // Create CloudWatch Dashboard
    const dashboard = new cloudwatch.Dashboard(this, 'CodeFlowDashboard', {
      dashboardName: 'CodeFlow-Production-Monitoring',
    })

    // Lambda metrics
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Lambda Invocations',
        width: 12,
        left: [props.lambdaFunction.metricInvocations()],
        right: [props.lambdaFunction.metricErrors()],
      }),
      new cloudwatch.GraphWidget({
        title: 'Lambda Duration & Cold Starts',
        width: 12,
        left: [props.lambdaFunction.metricDuration()],
        right: [
          new cloudwatch.Metric({
            namespace: 'AWS/Lambda',
            metricName: 'InitDuration',
            dimensionsMap: {
              FunctionName: props.lambdaFunction.functionName,
            },
          }),
        ],
      })
    )

    // Database metrics
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Database Connections & Performance',
        width: 12,
        left: [props.database.metricDatabaseConnections()],
        right: [
          props.database.metricCPUUtilization(),
          props.database.metricFreeableMemory(),
        ],
      })
    )

    // Custom application metrics
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'GitHub API Usage',
        width: 12,
        left: [
          new cloudwatch.Metric({
            namespace: 'CodeFlow/Application',
            metricName: 'GitHubAPI.Requests',
            statistic: 'Sum',
          }),
        ],
        right: [
          new cloudwatch.Metric({
            namespace: 'CodeFlow/Application',
            metricName: 'GitHubAPI.RateLimit',
            statistic: 'Average',
          }),
        ],
      })
    )

    // Create alarms
    const errorAlarm = new cloudwatch.Alarm(this, 'LambdaErrorAlarm', {
      alarmName: 'CodeFlow-Lambda-Errors',
      metric: props.lambdaFunction.metricErrors(),
      threshold: 5,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    })

    const durationAlarm = new cloudwatch.Alarm(this, 'LambdaDurationAlarm', {
      alarmName: 'CodeFlow-Lambda-Duration',
      metric: props.lambdaFunction.metricDuration(),
      threshold: 25000, // 25 seconds
      evaluationPeriods: 3,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    })

    // Database connection alarm
    const dbConnectionAlarm = new cloudwatch.Alarm(this, 'DatabaseConnectionAlarm', {
      alarmName: 'CodeFlow-Database-Connections',
      metric: props.database.metricDatabaseConnections(),
      threshold: 80, // 80% of max connections
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    })
  }
}
```

### Performance Monitoring

#### Frontend Performance Tracking

```typescript
// lib/performance.ts
export class PerformanceTracker {
  private static instance: PerformanceTracker
  private observers: PerformanceObserver[] = []

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker()
    }
    return PerformanceTracker.instance
  }

  init() {
    if (typeof window === 'undefined') return

    // Core Web Vitals tracking
    this.trackCoreWebVitals()
    
    // Navigation timing
    this.trackNavigationTiming()
    
    // Resource timing
    this.trackResourceTiming()
  }

  private trackCoreWebVitals() {
    // Track Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        startTime: number
      }

      this.sendMetric({
        name: 'LCP',
        value: lastEntry.startTime,
        unit: 'Milliseconds',
      })
    })

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(lcpObserver)
    } catch (e) {
      // LCP not supported
    }

    // Track First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as (PerformanceEntry & {
        processingStart: number
        startTime: number
      })[]

      entries.forEach((entry) => {
        const fid = entry.processingStart - entry.startTime
        this.sendMetric({
          name: 'FID',
          value: fid,
          unit: 'Milliseconds',
        })
      })
    })

    try {
      fidObserver.observe({ entryTypes: ['first-input'] })
      this.observers.push(fidObserver)
    } catch (e) {
      // FID not supported
    }

    // Track Cumulative Layout Shift (CLS)
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as (PerformanceEntry & {
        value: number
        hadRecentInput: boolean
      })[]

      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
    })

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(clsObserver)
      
      // Send CLS on page hide
      window.addEventListener('beforeunload', () => {
        this.sendMetric({
          name: 'CLS',
          value: clsValue,
          unit: 'Count',
        })
      })
    } catch (e) {
      // CLS not supported
    }
  }

  private trackNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

        this.sendMetric({
          name: 'TTI',
          value: navigation.domInteractive - navigation.fetchStart,
          unit: 'Milliseconds',
        })

        this.sendMetric({
          name: 'PageLoad',
          value: navigation.loadEventEnd - navigation.fetchStart,
          unit: 'Milliseconds',
        })
      }, 0)
    })
  }

  private trackResourceTiming() {
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceResourceTiming[]
      
      entries.forEach((entry) => {
        if (entry.name.includes('/_next/static/')) {
          this.sendMetric({
            name: 'StaticAssetLoad',
            value: entry.duration,
            unit: 'Milliseconds',
            dimensions: {
              ResourceType: this.getResourceType(entry.name),
            },
          })
        }
      })
    })

    try {
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)
    } catch (e) {
      // Resource timing not supported
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'JavaScript'
    if (url.includes('.css')) return 'CSS'
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'Image'
    return 'Other'
  }

  private sendMetric(metric: {
    name: string
    value: number
    unit: string
    dimensions?: Record<string, string>
  }) {
    // Send to analytics service or log for CloudWatch
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      }).catch(() => {
        // Fail silently for metrics
      })
    }
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Initialize performance tracking
if (typeof window !== 'undefined') {
  PerformanceTracker.getInstance().init()
}
```
