# my-ec-site

Next.js 16 ecommerce site using Supabase for products, authentication, and
orders, with a persistent shopping cart, Stripe Checkout, and Stripe webhooks
for payment processing.

The cart supports multiple products and quantities. Checkout prices and product
availability are always revalidated against Supabase on the server.

## Local development

Run the standard Next.js development server:

```bash
npm run dev
```

Run the application in the Cloudflare-compatible vinext development server:

```bash
npm run dev:vinext
```

## Environment variables

The application requires these environment variable names:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
ADMIN_EMAILS
```

Do not commit environment files or secret values.

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run build:vinext
```

The original Next.js build remains available with `npm run build`.

## Cloudflare Workers

Preview the production Worker locally after building:

```bash
npm run start:vinext
```

Deploy the Worker:

```bash
npm run deploy:vinext
```

Configure the environment variable names listed above in Cloudflare before
using the deployed application. Stripe must have a webhook endpoint targeting
`/api/webhook` with the `checkout.session.completed` event enabled.
