# Monitoring and Observability

This section defines the monitoring stack and observability strategy for CodeFlow's production deployment on **Vercel**.

> **Note:** Vercel's legacy "Monitoring" feature was sunset in November 2025. For advanced query-based monitoring, Vercel now offers **Observability Plus** with **Observability Query** (paid). For MVP, we use the free built-in tools: **Vercel Logs**, **Speed Insights**, and **Web Analytics**.

### Monitoring Architecture

#### Vercel Logs & Speed Insights (Free Tier)

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
      ? [
          new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
          }),
        ]
      : []),

    // Vercel captures console.log in production automatically
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.Console({
            format: winston.format.json(),
          }),
        ]
      : []),
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

    // In production, Vercel captures console output automatically
    if (process.env.NODE_ENV === 'production') {
      try {
        // Vercel logs capture console output automatically
        // For advanced metrics, integrate with Vercel Analytics or third-party service
        console.log('Metrics:', JSON.stringify(this.metrics, null, 2))
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

  recordGauge(
    name: string,
    value: number,
    unit: Metric['unit'],
    dimensions?: Record<string, string>
  ) {
    this.addMetric({ name, value, unit, dimensions })
  }
}

export const metrics = new MetricsCollector()

// Usage in API routes
export function withMetrics<T>(operation: string, handler: () => Promise<T>): Promise<T> {
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

**Vercel Built-in Observability (Free Tier):**

Vercel provides built-in monitoring through free features:

1. **Vercel Logs** - Real-time function logs viewable in the Vercel Dashboard
2. **Speed Insights** - Performance metrics and Core Web Vitals for every deployment (free)
3. **Web Analytics** - Visitor insights and page views (free, privacy-friendly)
4. **Deployment History** - Rollback capabilities and deployment status

> **Paid Option:** For advanced query-based monitoring (custom queries, saved notebooks), Vercel offers **Observability Plus** with **Observability Query**. Not required for MVP.

**Neon Database Monitoring:**

Neon provides built-in monitoring through the Neon Dashboard:

1. **Connection Monitoring** - Active connections and pooler status
2. **Query Performance** - Slow query identification
3. **Storage Usage** - Database size and growth trends
4. **Compute Usage** - Auto-suspend and compute time tracking

**Custom Application Metrics:**

```typescript
// lib/metrics.ts - Simplified for Vercel
export function trackGitHubAPIUsage(remaining: number, used: number, limit: number) {
  console.log('GitHubAPI.RateLimit', {
    remaining,
    used,
    limit,
    percentUsed: Math.round((used / limit) * 100),
    isThrottled: remaining < 100,
    timestamp: new Date().toISOString(),
  })

  // Alert when approaching rate limit
  if (remaining < 500) {
    console.warn('GitHubAPI.RateLimitWarning', {
      remaining,
      message: 'Approaching GitHub API rate limit',
    })
  }
}

export function trackDatabaseHealth(connectionCount: number, maxConnections: number) {
  console.log('Database.Connections', {
    active: connectionCount,
    max: maxConnections,
    percentUsed: Math.round((connectionCount / maxConnections) * 100),
    timestamp: new Date().toISOString(),
  })
}
```

**Alerting Strategy (Optional - Third-Party Integration):**

For production alerting beyond Vercel's built-in notifications:

- **Sentry** - Error tracking and alerting
- **Axiom** - Log aggregation with Vercel integration
- **Better Uptime** - Uptime monitoring and incident management

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
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming

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
    // Send to analytics service (Vercel Analytics captures Core Web Vitals automatically)
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
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
  }
}

// Initialize performance tracking
if (typeof window !== 'undefined') {
  PerformanceTracker.getInstance().init()
}
```
