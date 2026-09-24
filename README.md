# Ashford Communities – Resident Rent Help Page

A free, public page that lists organizations that help residents pay rent and utilities, by Ashford community, in English, Spanish and Vietnamese. No login, no tracking, no resident data.

## Files
- `index.html` – the page
- `assets/app.js` – page logic (language switch, property picker, printing, QR poster)
- `assets/data.js` – the organization directory (edit this to update agencies)
- `assets/styles.css` – styling
- `assets/qrcode.min.js` – QR code library (MIT license, davidshimjs/qrcodejs)
- `.nojekyll` – tells GitHub Pages to serve files as-is

## Put it online with GitHub Pages
1. Create a new **public** repository on GitHub (for example `rent-help`).
2. Click **Add file → Upload files**, drag in everything from this folder (keep the `assets` folder), and click **Commit changes**.
3. Go to **Settings → Pages**. Under *Build and deployment*, set **Source: Deploy from a branch**, **Branch: main**, folder **/(root)**, and click **Save**.
4. After about a minute, the page is live at `https://<your-github-username>.github.io/rent-help/`.

## Print the QR poster
Open the live GitHub Pages address, click **Print office poster**. The QR code is generated for that exact address, so it always matches.

## Updating agencies
Edit `assets/data.js` on GitHub (pencil icon), change the entry, and commit. The page updates within a minute.
