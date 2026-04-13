# ERA 99 - Production Deployment Guide

This guide details the step-by-step process to take the ERA 99 e-commerce platform from your local machine to a fully functional, live production environment.

## Phase 1: Set Up Production Services

Before deploying the code, you need live versions of all the services your app relies on.

### 1. Production Database (PostgreSQL)

Your app uses Prisma with PostgreSQL. You need a managed database for production.

- **Providers:** [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), [Neon.tech](https://neon.tech), or [Supabase](https://supabase.com).
- **Action:** Create a new database project.
- **Save:** Copy the `DATABASE_URL` (Connection String). Make sure it includes `sslmode=require` or uses a connection pool URL if recommended by the provider.

### 2. Authentication (NextAuth)

- **Action:** Generate a secure random string for signing JWT tokens.
- **Command:** Open your terminal and run `openssl rand -base64 32`.
- **Save:** Copy the generated string for your `NEXTAUTH_SECRET`.

### 3. Emails (Resend)

- **Action:** Go to [Resend.com](https://resend.com) and create an account.
- **Action:** Add and verify your actual domain name (e.g., `era99.com`) via DNS records.
- **Save:** Generate a new API Key for production (`RESEND_API_KEY`).

### 4. Payments (Paymob)

- **Action:** Log into your Paymob Dashboard.
- **Action:** Request production activation if you are currently using test credentials.
- **Save:**
  - `PAYMOB_API_KEY`
  - `PAYMOB_HMAC` (HMAC Secret for verifying webhooks)
  - `PAYMOB_INTEGRATION_ID` (For Card Payments)
  - `PAYMOB_WALLET_INTEGRATION_ID` (For Mobile Wallets, if applicable)
  - `PAYMOB_IFRAME_ID`

### 5. Analytics (Optional but Recommended)

- **Save:** `NEXT_PUBLIC_META_PIXEL_ID` (From Meta Business Manager).
- **Save:** `NEXT_PUBLIC_GA_ID` (From Google Analytics).

---

## Phase 2: Environment Variables Template

Gather all the keys you saved above. You will need to paste these into Vercel.
_(Do not commit this to GitHub, just keep it in a secure note for the deployment step)_.

```env
# Database
DATABASE_URL="postgres://user:password@host/dbname?sslmode=require"

# Authentication
NEXTAUTH_URL="https://www.era99.com"  # Your actual live domain
NEXTAUTH_SECRET="your_generated_random_string"

# Emails
RESEND_API_KEY="re_abc123..."

# Paymob
PAYMOB_API_KEY="zx..."
PAYMOB_HMAC="YOUR_HMAC_SECRET"
PAYMOB_INTEGRATION_ID="123456"
PAYMOB_IFRAME_ID="7890"

# Analytics
NEXT_PUBLIC_META_PIXEL_ID="your_pixel_id"
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

---

## Phase 3: Deployment on Vercel

Vercel is the creator of Next.js and provides the easiest deployment path.

1. **Sign Up/Log In**: Go to [Vercel.com](https://vercel.com) and log in with your GitHub account.
2. **Add New Project**: Click **"Add New"** > **"Project"**.
3. **Import Repository**: Find `tarekdx34/Qutb_StreetWear` and click **"Import"**.
4. **Configure Project**:
   - **Framework Preset**: Leave as "Next.js".
   - **Root Directory**: Leave as `./` (unless your code is in a subfolder).
   - **Build Command**: Leave default (`npm run build` or `next build`).
5. **Add Environment Variables**: Expand the **"Environment Variables"** section and paste _each key and value_ from Phase 2.
6. **Deploy**: Click the **"Deploy"** button. Vercel will install dependencies and build the site.

---

## Phase 4: Database Sync & Webhooks

Once Vercel says the deployment is successful, your site is live, but the database is completely empty and payments won't register.

### 1. Sync the Database Schema

You need to push your Prisma text schema to the live PostgreSQL database.

- In your local terminal, temporarily set your local `.env` `DATABASE_URL` to your **PRODUCTION** database URL.
- Run: `npx prisma db push`
- _(Important: revert your local `.env` back to your local database after doing this)._

### 2. Set Up Webhooks (Paymob)

Paymob needs to know where to send payment confirmations.

- Go to the Paymob Dashboard > Integrations.
- Edit your Card/Wallet integrations.
- Set the **Transaction Processed Callback / Webhook URL** to: `https://www.era99.com/api/paymob/webhook` (Replace with your actual Vercel/live domain).

---

## Phase 5: Admin Account Setup

Your live shop needs an Admin to manage products and orders.

1. **Register Normally**: Go to your live site (`https://era99.com/auth/register`) and create a standard customer account (e.g., `admin@era99.com`).
2. **Promote to Admin**: Since you don't have an admin panel yet, you must manually edit the database.
   - Go to your Database Provider's dashboard (e.g., Vercel Postgres Data explorer, or Supabase Table editor).
   - Find the `User` table.
   - Locate your newly registered email.
   - Change the `role` column from `"USER"` to `"ADMIN"`.
3. **Secure Admin Account**:
   - Log out and log back in to refresh your token.
   - Navigate to `https://era99.com/admin/setup-2fa` to link your Google Authenticator/Authy app.
4. **Add Products**: Use the Admin dashboard to create your first live products, set stock, and upload images.

---

## Phase 6: Final Testing Checklist

Before announcing the launch, perform a real test:

- [ ] Create a test customer account.
- [ ] Verify you receive the "Welcome/Verify Email" from Resend.
- [ ] Add an item to the cart.
- [ ] Proceed to checkout and complete a live payment (or use a test card if Paymob is still in test mode).
- [ ] Check the Admin Dashboard to ensure the order appears and is marked as "Paid".
