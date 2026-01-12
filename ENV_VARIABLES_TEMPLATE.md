# Environment Variables Template

Copy these to your `.env.local` file and fill in the values:

```env
# ============================================
# NEXTAUTH CONFIGURATION
# ============================================

# NextAuth Secret (Generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-super-secret-key-here"

# Base URL of your application
NEXTAUTH_URL="http://localhost:3000"

# ============================================
# NEON DATABASE (PostgreSQL)
# ============================================

# Neon PostgreSQL Connection String
# Format: postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech:5432/peso_db?sslmode=require"

# Direct connection (for Prisma migrations - required for Neon)
DIRECT_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech:5432/peso_db?sslmode=require"

# ============================================
# AMAZON SES EMAIL CONFIGURATION
# ============================================

# AWS Credentials for SES
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"

# SMTP Configuration (SES SMTP Interface)
# Get these from AWS SES SMTP Settings
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="your-ses-smtp-username"
SMTP_PASSWORD="your-ses-smtp-password"

# Sender Email (must be verified in SES)
EMAIL_FROM="noreply@yourdomain.com"
```

## Environment Variables Explanation

### NextAuth Variables

- **NEXTAUTH_SECRET**: Random string used to encrypt JWT tokens. Generate with `openssl rand -base64 32`
- **NEXTAUTH_URL**: Your application's base URL. Use `http://localhost:3000` for development

### Database Variables

- **DATABASE_URL**: Neon PostgreSQL connection string with connection pooling
- **DIRECT_URL**: Direct connection without pooling (required for Prisma migrations on Neon)

### Amazon SES Variables

- **AWS_REGION**: AWS region where your SES is configured (e.g., `us-east-1`)
- **AWS_ACCESS_KEY_ID**: IAM user access key with SES permissions
- **AWS_SECRET_ACCESS_KEY**: IAM user secret key
- **SMTP_HOST**: SES SMTP endpoint (format: `email-smtp.{region}.amazonaws.com`)
- **SMTP_PORT**: Use `587` for TLS or `465` for SSL
- **SMTP_USER**: SMTP username from SES credentials
- **SMTP_PASSWORD**: SMTP password from SES credentials
- **EMAIL_FROM**: Verified sender email address in SES

## How to Get These Values

### 1. Neon Database

1. Go to https://console.neon.tech
2. Create a new project or use existing
3. Copy connection string from dashboard
4. Use same string for both `DATABASE_URL` and `DIRECT_URL`

### 2. Amazon SES

1. Go to AWS Console → Amazon SES
2. **Verify your domain or email address**:
   - Go to "Verified identities"
   - Click "Create identity"
   - Follow verification process
3. **Create SMTP credentials**:
   - Go to "SMTP settings"
   - Click "Create SMTP credentials"
   - Save the username and password
4. **Get AWS credentials for SDK** (if not using SMTP):
   - Go to IAM → Users
   - Create user with `AmazonSESFullAccess` policy
   - Save access key and secret

### 3. NextAuth Secret

Run in terminal:
```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET`.
