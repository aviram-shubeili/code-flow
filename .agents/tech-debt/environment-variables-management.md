# Tech Debt: Environment Variables Management

**Priority:** Medium  
**Impact:** Developer Experience, Deployment, Maintainability  
**Created:** 2025-06-22  
**Related to:** Drizzle Migration (Step 3)

## 🎯 Issue Description

Currently, our environment variable handling is basic and requires manual `dotenv-cli` usage for Drizzle Kit commands. We need a more robust, environment-aware system that gracefully handles:

- **Local development** (`.env.local`)
- **Production** (environment variables, secrets management)
- **Testing** (`.env.test` or similar)
- **CI/CD** (environment-specific configurations)

## 🚨 Current State

### What Works

- Basic `.env.local` support via `dotenv-cli` in npm scripts
- Manual environment variable loading for development

### Pain Points

- **Manual dotenv prefix**: Every Drizzle script needs `dotenv -e .env.local --`
- **No environment detection**: No automatic switching between `.env.local`, `.env.production`, etc.
- **Inconsistent loading**: Some tools (Next.js) auto-load `.env.local`, others (Drizzle Kit) don't
- **No validation**: No checks for required environment variables
- **Deployment complexity**: Production deployments need different approach

## 💡 Proposed Solutions

### Option 1: Environment Detection Script

Create a wrapper script that detects environment and loads appropriate `.env` file:

```typescript
// scripts/env-wrapper.ts
const env = process.env.NODE_ENV || 'development';
const envFile =
  {
    development: '.env.local',
    test: '.env.test',
    production: '.env.production',
  }[env] || '.env.local';

// Load and execute command with proper env file
```

### Option 2: Enhanced dotenv Configuration

- Create environment-specific configuration files
- Use `dotenv-expand` for variable interpolation
- Add environment validation

### Option 3: Unified Configuration System

- Single configuration file that handles all environments
- Runtime environment detection
- Validation and fallbacks

## 🔧 Implementation Steps

1. **Research best practices** for multi-environment Node.js applications
2. **Audit current environment usage** across the codebase
3. **Choose and implement** a solution (likely Option 1 or 2)
4. **Update npm scripts** to use new system
5. **Add environment validation** for required variables
6. **Update documentation** with new environment handling
7. **Test across environments** (local, Docker, production)

## 📋 Requirements

### Must Have

- ✅ Automatic environment detection
- ✅ Support for `.env.local`, `.env.test`, `.env.production`
- ✅ Works with Drizzle Kit CLI commands
- ✅ Compatible with Next.js environment loading
- ✅ Clear error messages for missing variables

### Nice to Have

- ✅ Variable validation and type checking
- ✅ Environment variable documentation generation
- ✅ Secrets management integration (Azure Key Vault, etc.)
- ✅ Hot reloading of environment changes in development

## 🔗 Related Files

- `package.json` - npm scripts that need environment variables
- `drizzle.config.ts` - Database configuration
- `src/auth.ts` - Auth.js configuration
- `src/db/index.ts` - Database connection
- `.env.local` - Current development environment
- `docker-compose.yml` - Docker environment handling

## 📚 Research Links

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [dotenv best practices](https://github.com/motdotla/dotenv#should-i-commit-my-env-file)
- [12-Factor App Config](https://12factor.net/config)
- [Environment-specific configurations](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)

## ⚠️ Risks

- **Breaking changes**: Existing development workflows might break
- **Deployment complexity**: Production deployments need testing
- **Tool compatibility**: Some tools might not work with new environment system
- **Secret exposure**: Improper handling could expose sensitive data

## 🎯 Success Criteria

- [ ] No more manual `dotenv -e .env.local --` prefixes needed
- [ ] Automatic environment detection based on `NODE_ENV`
- [ ] Clear error messages for missing required variables
- [ ] Works seamlessly in development, testing, and production
- [ ] Documentation updated with new environment handling
- [ ] All existing functionality continues to work

## 📊 Effort Estimate

**Time:** 4-6 hours  
**Complexity:** Medium  
**Dependencies:** None (can be done independently)

## 🏷️ Labels

`tech-debt` `environment` `configuration` `developer-experience` `drizzle` `deployment`
