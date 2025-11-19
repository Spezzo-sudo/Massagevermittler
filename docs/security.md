# Security Policy

## Overview

Massagevermittlung is a marketplace application handling sensitive user data, bookings, and payment information. Security is a critical concern across all layers of the application.

## Security Principles

1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Users and services only have necessary permissions
3. **Secure by Default**: Security-first configuration and development practices
4. **Input Validation**: All user input is validated and sanitized
5. **Data Protection**: Sensitive data is encrypted in transit and at rest

## Environment Configuration

### Required Environment Variables

Never commit `.env.local` to version control. Use the `.env.example` template:

```bash
cp .env.example .env.local
# Fill in actual values from your services
```

**Critical secrets that must never be committed:**
- `STRIPE_SECRET_KEY` - Stripe API secret
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin key
- `SENDGRID_API_KEY` - SendGrid API key
- `TWILIO_AUTH_TOKEN` - Twilio authentication token
- `NEXT_PUBLIC_*` variables should NOT contain secrets (these are exposed to the browser)

### .gitignore Protection

The `.gitignore` file prevents accidental commits of:
- `.env.local` and all `.env.*.local` files
- `node_modules/`
- `.next/` build directory
- IDE-specific files

## Authentication & Authorization

### Supabase Auth

- Email-based authentication with magic links
- RLS (Row-Level Security) policies enforce user isolation
- Role-based access control: `admin`, `customer`, `therapist`

**Policies enforced:**
- Users can only access their own profile
- Therapists can only modify their availability
- Admins have elevated permissions for system management
- Bookings are isolated by customer/therapist relationship

### Middleware Protection

`middleware.ts` enforces:
- Role-based route protection
- Redirect unauthenticated users to login
- Token validation on protected routes

```typescript
// Example: /admin routes require admin role
// Example: /customer routes require customer role
```

## Data Validation

### Input Validation Strategy

All user inputs are validated using Zod schemas in `lib/validation.ts`:

**Booking Validation:**
- Location within Ko Phangan geographic bounds
- Positive service ID
- Valid ISO 8601 datetime
- Address labels ≤ 200 characters

**Enforcement:**
- Validation happens at API boundaries
- Invalid payloads are rejected with 400 Bad Request
- Validation errors don't expose internal details

See `lib/validation.ts` for complete schema definitions.

## Payment Security

### Stripe Integration

**PCI Compliance:**
- Stripe Checkout handles card data (not stored locally)
- No card information flows through our servers
- Webhook signing validates Stripe events

**Checkout Session Security:**
```typescript
// src/lib/stripe.ts
createCheckoutSession({
  amount,           // Amount in smallest currency unit (cents/satang)
  currency: 'thb',  // Currency code
  successUrl,       // Redirect after successful payment
  cancelUrl         // Redirect if user cancels
})
```

**Best Practices:**
- Always validate webhook signatures
- Never log sensitive payment data
- Use environment variables for API keys
- Verify amounts on both frontend and backend

### Database Security

**Supabase RLS Policies:**

```sql
-- Therapists can only view their own profile
CREATE POLICY therapist_self_access
ON therapist_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Customers can only view their bookings
CREATE POLICY customer_booking_access
ON bookings
FOR SELECT
USING (customer_id = auth.uid());
```

See `docs/data-model.sql` for complete policy definitions.

## API Security

### Route Authentication

All protected API routes require valid JWT tokens:

```typescript
// src/app/api/protected/route.ts
import { createRouteClient } from '@/lib/supabase/routeClient'

export async function POST(request: Request) {
  const supabase = createRouteClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Process authenticated request
}
```

### Webhook Validation

Stripe webhooks must be validated with secret:

```typescript
// Verify webhook signature
const signature = request.headers.get('stripe-signature')
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
)
```

## Notification Security

### SendGrid & Twilio

- API keys stored in environment variables
- No user data stored in notifications (only IDs and references)
- Email templates don't contain sensitive information
- Phone numbers validated before SMS/WhatsApp sending

## CORS & Content Security

**Next.js Security Headers:**
- Configured via Next.js middleware
- Restricts cross-origin requests
- CSP headers prevent XSS attacks

## Dependency Security

### Vulnerability Management

**Regular Audits:**
```bash
npm audit              # Find vulnerabilities
npm audit fix          # Auto-fix where possible
npm outdated           # Check for updates
```

**GitHub Actions CI:**
- `npm audit` runs on every PR
- Security warnings block high-severity issues
- Dependencies regularly updated

**Known Vulnerabilities:**
- Track `npm audit` output in CI/CD
- Address high/critical issues immediately
- Document low-risk vulnerabilities

## Testing for Security

### Implemented Tests

**Input Validation Tests** (`lib/__tests__/validation.test.ts`):
- Boundary conditions (Ko Phangan geographic bounds)
- Invalid inputs are rejected
- Schema enforcement for all fields

**Distance Calculation Tests** (`lib/__tests__/matching.test.ts`):
- Haversine formula accuracy
- Symmetric distance calculation
- Edge cases (equator crossing, hemisphere)

**Stripe Integration Tests** (`lib/__tests__/stripe.test.ts`):
- Correct payment session creation
- Proper environment variable handling
- Amount and currency validation

### Recommended Additional Tests

- Supabase RLS policy tests
- Webhook signature validation tests
- Rate limiting tests
- Authentication edge cases

## Incident Response

### Reporting Security Issues

**Do NOT open public issues for security vulnerabilities.**

Instead:
1. Email security concerns to the project maintainers
2. Provide detailed information about the vulnerability
3. Allow time for the team to develop a fix
4. Coordinate public disclosure after patches are released

## Deployment Security

### Production Environment

**Required checks before deployment:**
- All tests passing
- No TypeScript errors
- ESLint passes
- `npm audit` shows no high/critical issues
- Environment variables properly configured (never hardcoded)

**Vercel Deployment:**
- Use Vercel's secret management for environment variables
- Enable branch protection on main branch
- Require PR reviews before merging
- Use GitHub Actions for automated testing

## Compliance

### Data Protection

- User data encrypted in transit (HTTPS)
- Sensitive data encrypted at rest (Supabase encryption)
- GDPR-compliant data handling (deletion, export on request)
- No data sharing without explicit consent

### PCI DSS Compliance

- Stripe handles payment card data
- No card data stored in our database
- Webhook events properly validated
- Access logs maintained for compliance

## Monitoring & Logging

### Application Logging

**What to log:**
- Authentication events (login, logout, role changes)
- API errors and exceptions
- Payment events (checkout, success, failure)
- Data modifications (bookings, availability changes)

**What NOT to log:**
- Passwords or secrets
- Full card numbers or tokens
- Sensitive personal information
- Environment variable values

### Error Handling

- Errors sanitized before client exposure
- Internal error details logged server-side only
- User-friendly error messages in UI
- Stack traces never shown in production

## Future Security Improvements

- [ ] Implement rate limiting on API endpoints
- [ ] Add 2FA for admin accounts
- [ ] Setup Sentry for error tracking and monitoring
- [ ] Implement request signing for internal APIs
- [ ] Add database query parameterization audit
- [ ] Setup security headers configuration
- [ ] Implement CSRF protection
- [ ] Add bot detection (reCAPTCHA for public forms)

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Stripe Security Best Practices](https://stripe.com/docs/security)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security)
- [Supabase Security](https://supabase.com/docs/guides/self-hosting/security)
- [PCI DSS Compliance](https://www.pcisecuritystandards.org/)
