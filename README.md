# CruiseLinx

Premium P2P car rental marketplace — browse, book, and drive verified vehicles with ease. Offline-capable, mobile-first.

## Architecture

- **Frontend**: Next.js 16 (App Router, TypeScript)
- **Backend**: Convex (database, auth, serverless functions)
- **Styling**: Tailwind CSS v4
- **Maps**: Mapbox GL
- **Payments**: M-Pesa Daraja (Safaricom)
- **Deployment**: Vercel (preview + production), Docker (container)

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | Yes |
| `AUTH_SECRET_0`–`AUTH_SECRET_3` | Convex auth secrets (generate with `openssl rand -base64 32`) | Yes |
| `MAPBOX_TOKEN` | Mapbox access token | Yes |
| `DARAJA_CONSUMER_KEY` | M-Pesa Daraja consumer key | Yes |
| `DARAJA_CONSUMER_SECRET` | M-Pesa Daraja consumer secret | Yes |
| `DARAJA_PASSKEY` | M-Pesa Daraja passkey | Yes |
| `DARAJA_SHORTCODE` | M-Pesa shortcode (default: `174379`) | Yes |
| `DARAJA_ENV` | `sandbox` or `production` | Yes |
| `NEXT_PUBLIC_URL` | App URL (e.g. `https://cruiselinx.vercel.app`) | Yes |
| `MPESA_CALLBACK_SECRET` | Shared secret for M-Pesa callback auth | Yes |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key for push notifications | Yes |
| `VAPID_PUBLIC_KEY` | VAPID public key (server-side) | Yes |
| `VAPID_PRIVATE_KEY` | VAPID private key (server-side only) | Yes |

## Convex Setup

```bash
npx convex dev
npx convex deploy
```

## Deployment

### Vercel (recommended)

1. Connect your GitHub repo to Vercel
2. Set all environment variables from `.env.example` in the Vercel dashboard
3. Deploy — Vercel auto-detects Next.js and builds on every push

### Docker

```bash
docker build -t cruiselinx .
docker run -p 3000:3000 -e NEXT_PUBLIC_CONVEX_URL=<url> cruiselinx
```

## CI/CD

GitHub Actions runs on every push and PR:

- **Type check** — `npx tsc --noEmit`
- **Lint** — `npm run lint`
- **Unit tests** — `npm run test:run` (219 tests)
- **Build** — `npm run build` (with production env vars)
- **Security** — CodeQL SAST, npm audit, TruffleHog secret scan, OWASP ZAP, dependency review

## Testing

```bash
npm run test        # Watch mode
npm run test:run    # Single run
```

## Security

- Rate limiting on auth and payment endpoints (5 requests per 15 min per IP)
- CORS restricted to `NEXT_PUBLIC_URL`
- Security headers (X-Frame-Options, X-Content-Type-Options, Permissions-Policy)
- Input validation via Zod schemas on all API routes
- Convex server-side authorization on all mutations and queries
- M-Pesa callback signature verification

## Project Structure

```
src/
  app/              # Next.js App Router pages
  components/       # React components
  hooks/            # Custom React hooks
  lib/              # Utilities, rate limiting, M-Pesa helpers
convex/             # Convex backend (queries, mutations, schema)
.github/workflows/  # CI/CD pipelines
```