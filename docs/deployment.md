# Production Deployment Guide

## Overview

Massagevermittler is a Next.js 14 application designed to run on Vercel with Supabase as the backend. This guide covers deployment, configuration, and scaling.

## Prerequisites

- Vercel account (https://vercel.com)
- Supabase project (https://supabase.com)
- GitHub repository
- Domain name (optional but recommended)

## Deployment Steps

### 1. Prepare Repository

```bash
# Ensure all code is committed
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 2. Set Up Supabase Production Database

```bash
# Create production database
# 1. Go to https://supabase.com/dashboard
# 2. Create a new project (production-kophangan)
# 3. Note the:
#    - Project URL
#    - Anon key
#    - Service role key

# Run migrations
supabase db push --db-url <your-prod-db-url>
```

### 3. Enable Row Level Security (RLS)

```bash
# Enable RLS on all user-facing tables
psql <your-prod-db-url> -f docs/rls-policies.sql
```

### 4. Configure Stripe

```bash
# 1. Create Stripe Live Account (https://stripe.com)
# 2. Get Live API keys:
#    - Publishable Key (pk_live_...)
#    - Secret Key (sk_live_...)
# 3. Set up webhook:
#    - Endpoint: https://yourdomain.com/api/webhooks/stripe
#    - Events: payment_intent.succeeded, payment_intent.payment_failed, checkout.session.completed
#    - Get Signing Secret (whsec_...)
```

### 5. Configure SendGrid

```bash
# 1. Create SendGrid account (https://sendgrid.com)
# 2. Create API key
# 3. Verify sender email
# 4. Note: API Key
```

### 6. Configure Twilio

```bash
# 1. Create Twilio account (https://twilio.com)
# 2. Set up WhatsApp Business Profile
# 3. Get:
#    - Account SID
#    - Auth Token
#    - WhatsApp Number (whatsapp:+1234567890)
```

### 7. Configure Google Maps

```bash
# 1. Enable in Google Cloud Console:
#    - Maps JavaScript API
#    - Places API
# 2. Create API key
# 3. Restrict to:
#    - HTTP referrers: yourdomain.com/*
#    - APIs: Maps JS API, Places API
```

### 8. Deploy to Vercel

```bash
# Option A: Connect GitHub (recommended)
# 1. Go to https://vercel.com/new
# 2. Select "Import Git Repository"
# 3. Choose your repository
# 4. Configure:
#    - Framework: Next.js
#    - Build Command: npm run build
#    - Output Directory: .next
# 5. Add environment variables (see below)
# 6. Deploy

# Option B: Vercel CLI
vercel
# Follow prompts
```

## Environment Variables

### Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

### Stripe (Live)

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### SendGrid

```env
SENDGRID_API_KEY=[your-api-key]
SENDGRID_FROM_EMAIL=noreply@example.com
```

### Twilio

```env
TWILIO_ACCOUNT_SID=[your-account-sid]
TWILIO_AUTH_TOKEN=[your-auth-token]
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

### Google Maps

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=[your-api-key]
```

### Application

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

## Post-Deployment Checklist

- [ ] Test all authentication flows
- [ ] Verify email notifications are being sent
- [ ] Test booking creation and payment
- [ ] Check Stripe webhook is receiving events
- [ ] Monitor error logs in Vercel dashboard
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure email alerts for errors
- [ ] Review security headers (HSTS, CSP, etc.)
- [ ] Test rate limiting under load
- [ ] Verify RLS policies are blocking unauthorized access

## Monitoring & Maintenance

### Error Tracking

```bash
# Option 1: Vercel's built-in monitoring
# https://vercel.com/docs/concepts/observability

# Option 2: Sentry (recommended for detailed error tracking)
# 1. Create Sentry account
# 2. Create Next.js project
# 3. Install Sentry SDK
# 4. Add to next.config.js
```

### Database Backups

```bash
# Supabase automatically backs up daily
# Download backups: https://supabase.com/docs/guides/database/managing-backups
```

### Performance Monitoring

- Monitor Core Web Vitals in Vercel Analytics
- Check database query performance
- Monitor API response times
- Track rate limit hits

## Scaling

### Database

```bash
# Monitor performance:
supabase projects list

# If needed, upgrade Supabase plan to:
- Pro: Custom domain, increased connections
- Custom: Dedicated resources
```

### Application

Vercel automatically scales horizontally. Monitor:
- CPU usage
- Memory usage
- Cold start times

### Caching

Consider adding caching for:
- Product listings
- Therapist profiles
- Popular searches

```typescript
// Example: Cache therapist list for 5 minutes
response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
```

## Disaster Recovery

### Database Restore

```bash
# 1. Go to Supabase dashboard
# 2. Select "Backups" from menu
# 3. Choose backup to restore
# 4. Confirm restoration
```

### Application Rollback

```bash
# Vercel stores all deployments
# 1. Go to Vercel dashboard
# 2. Select deployment to rollback
# 3. Click "Redeploy"
```

### Data Export

```bash
# Export critical data regularly
supabase export --schema public --schema auth
```

## Security Checklist

- [ ] HTTPS enabled on domain
- [ ] HSTS header configured
- [ ] CSP headers configured
- [ ] Environment variables not hardcoded
- [ ] RLS policies enforced
- [ ] Rate limiting enabled
- [ ] Webhook signatures verified
- [ ] Secrets rotated quarterly
- [ ] Error messages don't leak sensitive data
- [ ] API keys restricted by IP (if possible)

## Troubleshooting

### Common Issues

**Problem: 500 errors after deployment**
- Check environment variables are set
- Review Vercel logs for details
- Verify database connection
- Check Supabase status page

**Problem: Slow API responses**
- Check database query performance
- Review N+1 queries
- Add caching where applicable
- Consider database scaling

**Problem: Webhook not receiving events**
- Verify webhook URL is correct
- Check webhook signing secret
- Verify endpoint response time < 30s
- Check Stripe dashboard for retry attempts

## Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- Next.js Docs: https://nextjs.org/docs

## Next Steps

After deployment:
1. Monitor performance for first week
2. Collect user feedback
3. Plan scaling improvements
4. Set up automated backups
5. Create disaster recovery plan
