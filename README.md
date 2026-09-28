# Ashford Communities – Resident Rent Help Page

A free, public page that lists organizations that help residents pay rent and utilities, by Ashford community, in English, Spanish, Vietnamese, Chinese (Simplified), Hindi, Urdu and Pashto. No login, no tracking, no resident data.

## Files
- `index.html` – the page
- `assets/app.js` – page logic (language switch, property picker, printing, QR poster)
- `assets/data.js` – the organization directory, with English/Spanish/Vietnamese text (edit this to update agencies)
- `assets/translations.js` – Chinese, Hindi, Urdu and Pashto text, including a one-line description per agency
- `assets/styles.css` – styling
- `assets/ashford-logo-white.png` – header logo (from ashfordco.com)
- `assets/qrcode.min.js` – QR code library (MIT license, davidshimjs/qrcodejs)
- `.nojekyll` – tells GitHub Pages to serve files as-is

## Put it online with GitHub Pages
Repo: `Ashford-Communities/ashford-rent-help` (must be **public** for free GitHub Pages).
1. Upload everything in this folder to the repo (keep the `assets` folder) and commit.
2. **Settings → Pages** → Source: **Deploy from a branch**, Branch: **main**, folder **/(root)** → **Save**.
3. After about a minute it is live at `https://ashford-communities.github.io/ashford-rent-help/`.

## Custom domain (renthelp.ashfordco.com)
1. GoDaddy → ashfordco.com → DNS: delete any existing `renthelp` record, then add
   **CNAME** · Name `renthelp` · Value `ashford-communities.github.io` · TTL 1 hour.
2. GitHub → **Settings → Pages → Custom domain**: `renthelp.ashfordco.com` → Save (this adds a `CNAME` file to the repo).
3. Once the DNS check passes, tick **Enforce HTTPS**.

## Branding
Colors, font (Poppins) and logo match ashfordco.com. Brand colors are the variables at the top of `assets/styles.css`.

## Print the QR poster
Open the live GitHub Pages address, click **Print office poster**. The QR code is generated for that exact address, so it always matches.

## Updating agencies
Edit `assets/data.js` on GitHub (pencil icon), change the entry, and commit. The page updates within a minute.
When you **add** an agency, also add its one-line description for each language in `assets/translations.js` (same `id`). If one is missing, that language shows the English description.

After changing any file in `assets/`, bump the `?v=` number on its link in `index.html` (e.g. `app.js?v=3` → `app.js?v=4`) so returning visitors don't get a stale cached copy.
