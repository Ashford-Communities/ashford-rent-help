# Rent Help Finder – Ashford Communities (internal)

Staff tool for finding rent and utility help for residents, by county, in English, Spanish and Vietnamese. Hosted on Vercel. Every page requires a Microsoft 365 sign-in with an @ashfordco.com account. A sign-in lasts 5 hours; after that the page clears itself and Microsoft asks for credentials again. Staff get a warning 10 minutes before.

Branding follows ashfordco.com (navy #004274, green-to-navy header gradient, Poppins). Light / Dark / Device appearance is under **My Account** and is remembered per browser.

## How it works
- `index.html`: the whole page. No build step.
- `middleware.js`: sends anyone who isn't signed in to Microsoft sign-in.
- `api/auth/*`: Microsoft 365 sign-in (5-hour sessions, `SESSION_HOURS` in `api/_lib/session.js`), sign-out and "who am I".
- `api/outreach.js`: the **Early outreach** tab. It calls the Entrata API (`getLeases` + `getLeaseArTransactions`) and returns unit, status and balances only. Resident names never reach the browser.
- The **Referral log**, **Dashboard**, team dates, agency status updates and "Log referral" buttons need shared storage that only exists when the page runs inside Claude. On Vercel they're hidden automatically and come back if shared storage is added.

## Setup
1. **Microsoft Entra app registration** (entra.microsoft.com → App registrations → New registration)
   - Supported account types: *Accounts in this organizational directory only*.
   - Redirect URI: platform **Web**, `https://ashford-rent-help-internal.vercel.app/api/auth/callback`. Add one for each custom domain too.
   - Certificates & secrets → New client secret. Copy the **Value**.
   - Optional: in Enterprise applications → this app → Properties, set *Assignment required* to Yes, then assign only the staff or groups who should have access.
2. **Entrata API key**: it must be allowed to call `getLeases` (leases service) and `getLeaseArTransactions` (artransactions service).
3. **Vercel → Settings → Environment Variables** (see `.env.example`):
   `ENTRATA_BASE_URL`, `ENTRATA_API_KEY`, `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `SESSION_SECRET` (a long random string: `openssl rand -base64 32`). Then redeploy.

## Troubleshooting
If the Early outreach tab shows blank unit numbers, check the Vercel function logs for `getLeases: no unit field found`. That line lists the field names Entrata returned, so the unit mapping in `api/outreach.js` can be adjusted.
