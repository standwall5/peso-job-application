# Migration Dependencies Installation

Run these commands in order:

```bash
# Remove Supabase dependencies
npm uninstall @supabase/supabase-js @supabase/auth-helpers-nextjs

# Install NextAuth + Prisma
npm install next-auth@latest @prisma/client@latest
npm install -D prisma@latest

# Install AWS SES (we'll use nodemailer with SES transport)
npm install nodemailer @aws-sdk/client-ses
npm install -D @types/nodemailer

# Initialize Prisma
npx prisma init
```

After running these, proceed to the next steps.
