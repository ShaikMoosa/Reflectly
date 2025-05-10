# Deployment Checks for Reflectly

This document provides a checklist for deploying Reflectly to production environments and fixing common issues.

## Pre-Deployment Checks

Before deploying to production, run the following checks:

```bash
# 1. Verify production keys are used (not development keys)
npm run verify-keys

# 2. Standardize migration files
npm run migrations:standardize
```

## Common Issues and Fixes

### 1. Multiple GoTrueClient Instances

**Symptoms**: Console warning about multiple GoTrueClient instances detected.

**Fix**: 
- Ensure all Supabase client usage follows the singleton pattern.
- Import only from the appropriate client file:
  - For client-side: `import { supabaseClient } from '@/utils/supabase/client'`
  - For server-side: `import { createClient } from '@/utils/supabase/server'`

### 2. Clerk Development Keys in Production

**Symptoms**: Warning about using Clerk development keys in production.

**Fix**:
- Update your environment variables with production keys from the Clerk dashboard.
- Add the following to your `.env.production` or deployment environment:
  ```bash
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
  CLERK_SECRET_KEY=sk_live_...
  ```

### 3. Deprecated Clerk Props

**Symptoms**: Console warnings about deprecated props like `afterSignInUrl`.

**Fix**:
- For `afterSignInUrl`, use `signInUrl` instead
- For `afterSignOutUrl`, use `signOutUrl` instead
- For backwards compatibility, Clerk still accepts `afterSignInUrl` and `afterSignOutUrl` but will show warnings.

### 4. Database 404/400 Errors

**Symptoms**: API requests failing with 404 or 400 errors when accessing database tables.

**Fix**:
- Ensure all migrations are properly applied to your production database.
- Check that table names match between environments.
- Run the standardization script to ensure migration files follow the proper format:
  ```bash
  npm run migrations:standardize
  ```
- Use the Supabase dashboard to manually verify tables exist.

## Post-Deployment Checks

After deploying, verify:

1. Authentication flows work correctly
2. Database access works without errors
3. All subscriptions and usage data is correctly tracked
4. No console errors related to Clerk or Supabase

## Troubleshooting Tips

- If you see 500 errors in middleware, check that your Clerk configuration is correct.
- For database-related issues, check the Supabase dashboard and logs for errors.
- For client-side errors, use browser developer tools to diagnose network requests.
- Use the application's error logs to track down specific issues. 