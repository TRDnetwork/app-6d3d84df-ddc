# Gradient Cart Deployment Guide

## Prerequisites

- **Docker**: Version 20.10+ and Docker Compose
- **Supabase Account**: Free tier works
- **Stripe Account**: For payment processing
- **Resend Account**: For email notifications
- **Domain**: For production deployment (optional)

## Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual values:
   - Get Supabase keys from Project Settings → API
   - Get Stripe keys from Stripe Dashboard → Developers → API Keys
   - Get Resend API key from Resend Dashboard → API Keys
   - Set `ALLOWED_ORIGIN` to your production domain

## Deploy with Docker

### Build and Run
```bash
# Build the Docker image
docker build -t gradient-cart .

# Run the container
docker run -d \
  --name gradient-cart \
  -p 3000:3000 \
  --env-file .env \
  gradient-cart
```

### Verify
```bash
# Check container status
docker ps

# View logs
docker logs gradient-cart

# Test the application
curl http://localhost:3000
```

## Deploy with Docker Compose

### Start Services
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Stop Services
```bash
# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Deploy to Railway

### Option 1: Using Railway CLI
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to existing project or create new
railway link

# Deploy
railway up
```

### Option 2: Using Railway Dashboard
1. Connect your GitHub repository
2. Add environment variables from `.env.example`
3. Deploy with default settings

## Deploy to Render

### Blueprint Configuration
Create `render.yaml` in your repository:

```yaml
services:
  - type: web
    name: gradient-cart
    env: node
    buildCommand: npm install
    startCommand: npx serve -s . -l 3000
    envVars:
      - key: NODE_ENV
        value: production
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: STRIPE_PUBLISHABLE_KEY
        sync: false
      - key: RESEND_API_KEY
        sync: false
```

### Deployment Steps
1. Push to GitHub
2. Connect repository in Render Dashboard
3. Add environment variables
4. Deploy

## Environment Variables

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGci...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |
| `RESEND_API_KEY` | Resend API key | `re_...` |
| `ALLOWED_ORIGIN` | CORS allowed origin | `https://yourdomain.com` |

### Optional Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `http://localhost:3000` |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit requests | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `60000` |

## Database Migrations

### Initial Setup
1. Log into Supabase Dashboard
2. Go to SQL Editor
3. Run `db/schema.sql` to create tables
4. Run `db/seed.sql` to populate sample data

### Edge Functions Deployment
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy validate-discount
supabase functions deploy create-order
```

### Verify Functions
```bash
# Test discount validation
curl -X POST 'https://[project-ref].supabase.co/functions/v1/validate-discount' \
  -H 'Content-Type: application/json' \
  -d '{"code": "WELCOME10"}'

# Test order creation (requires auth)
curl -X POST 'https://[project-ref].supabase.co/functions/v1/create-order' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [JWT_TOKEN]' \
  -d '{"customer_email": "test@example.com", "total_amount": 100, "final_amount": 100, "items": []}'
```

## Testing Before Deployment

### Run Tests
```bash
# Install test dependencies
npm install --save-dev vitest jsdom

# Run test suite
npm test

# Run specific test file
npx vitest tests/app.test.js
```

### Build Verification
```bash
# Check for TypeScript errors (if applicable)
npx tsc --noEmit

# Audit dependencies
npm audit --audit-level=high

# Lint code (if configured)
npx eslint .
```

## Production Checklist

- [ ] All environment variables set
- [ ] Database tables created and seeded
- [ ] Edge Functions deployed
- [ ] SSL certificate configured
- [ ] Domain DNS records updated
- [ ] CDN configured (optional)
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Security headers configured
- [ ] Rate limiting enabled

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify `ALLOWED_ORIGIN` matches your frontend URL
   - Check Supabase Edge Function CORS settings

2. **Database Connection**
   - Verify Supabase project is active
   - Check RLS policies allow necessary operations

3. **Payment Issues**
   - Test with Stripe test cards
   - Verify webhook endpoint is reachable
   - Check Stripe dashboard for declined payments

4. **Email Not Sending**
   - Verify Resend API key
   - Check email domain verification
   - Monitor Resend dashboard for errors

### Logs and Monitoring

```bash
# Docker logs
docker logs gradient-cart

# Docker Compose logs
docker-compose logs -f

# Railway logs
railway logs

# Render logs
# Available in Render Dashboard
```

## Maintenance

### Regular Tasks
- Weekly: Check dependency updates
- Monthly: Rotate API keys
- Quarterly: Security audit
- Annually: Full infrastructure review

### Backup Strategy
1. Database: Supabase daily backups
2. Files: Docker image registry
3. Configuration: Version control

### Scaling
- Horizontal scaling: Add more containers
- Database: Upgrade Supabase plan
- CDN: Cloudflare or similar
- Cache: Redis for frequent queries

## Support

For deployment issues:
1. Check logs for error messages
2. Verify all environment variables
3. Test endpoints individually
4. Consult documentation in `/docs`

For production issues:
- Contact: support@gradientcart.com
- Status Page: [Link to status page]
- Documentation: `/docs/API.md`

---

*Last Updated: [Current Date]*  
*Deployment Version: 1.0*