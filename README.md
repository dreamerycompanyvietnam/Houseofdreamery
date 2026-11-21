# House of Dreamery — Resend booking email

This bundle replaces the browser-side EmailJS call with a Vercel serverless function. The Resend secret stays on the server and is never included in the page source.

## Add the secret in Vercel

1. Open the **correct** Vercel project for `houseofdreamery.vercel.app`.
2. Go to **Settings → Environment Variables**.
3. Add `RESEND_API_KEY` and paste the API key from Resend. Select Production (and Preview/Development if you need those environments).
4. Optionally set `RESEND_FROM` after verifying your sending domain in Resend, for example `House of Dreamery <booking@your-verified-domain.com>`.
5. Redeploy after adding or changing environment variables.

Never put the Resend API key in `index.html`, GitHub source, or chat.

## Resend sender limits

The default sender is `House of Dreamery <onboarding@resend.dev>`, suitable for initial integration checks. Resend's test sender is restricted to verified test recipients. For the booking notifications to reach `Dreamerycompanyvietnam@gmail.com`, make sure that address is allowed for your Resend account, or verify a domain you own in Resend and set `RESEND_FROM` to an address on that domain. The recipient is configured server-side in `api/bookings.js`.

## Deploy

Deploy this folder as the project root so Vercel serves `index.html`, the local image files, and `api/bookings.js`. The project must use Vercel's Node.js runtime. Then submit one test booking and check the Resend email log.

The in-memory request throttle is best-effort and resets when the serverless instance restarts. The form validates booking data on both the browser and server.
