// Signed session cookie shared by middleware.js and the API functions.
// Uses Web Crypto so it runs in both the Edge (middleware) and Node runtimes.
export const SESSION_COOKIE = 'rh_session';
export const STATE_COOKIE = 'rh_state';
export const SESSION_HOURS = 5; // sign-in lasts 5 hours, then Microsoft sign-in is required again

const enc = new TextEncoder();
const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

export function randomToken(n = 24) {
  return b64url(crypto.getRandomValues(new Uint8Array(n)));
}

export function getCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(/;\s*/)) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i) === name) return decodeURIComponent(part.slice(i + 1));
  }
  return null;
}

export function cookieHeader(name, value, maxAgeSeconds) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

export async function sign(payload, secret) {
  const body = b64url(enc.encode(JSON.stringify(payload)));
  return `${body}.${await hmac(secret, body)}`;
}

export async function verify(token, secret) {
  if (!token || !secret) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = await hmac(secret, body);
  if (expected.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(body)));
    return payload.exp && payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export async function createSession(user, secret) {
  const token = await sign({ ...user, exp: Date.now() + SESSION_HOURS * 3600e3 }, secret);
  return cookieHeader(SESSION_COOKIE, token, SESSION_HOURS * 3600);
}

export function readSession(request) {
  return verify(getCookie(request, SESSION_COOKIE), process.env.SESSION_SECRET);
}

// Small styled page for the sign-in and sign-out screens.
export function page(title, bodyHtml, status = 200, headers = {}) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} – Rent Help Finder</title><style>
:root{--bg:#EAF0EE;--panel:#fff;--ink:#16262B;--muted:#51656B;--line:#C9D6D3;--teal:#0E5E6F;--teal-ink:#fff}
@media (prefers-color-scheme: dark){:root{--bg:#0F1A1D;--panel:#16252A;--ink:#E4EEEC;--muted:#9DB2B6;--line:#2C4248;--teal:#5FB3C4;--teal-ink:#0F1A1D}}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;padding:16px;box-sizing:border-box}
.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:24px;max-width:420px;width:100%;box-sizing:border-box}
.brand{font-size:13px;font-weight:600;color:var(--muted);margin:0 0 12px}h1{font-size:22px;margin:0 0 8px}p{margin:0 0 18px;color:var(--muted)}
a.btn{display:inline-block;background:var(--teal);color:var(--teal-ink);border-radius:8px;padding:10px 16px;font-weight:600;text-decoration:none}
</style></head><body><main class="card"><p class="brand">Rent Help Finder · Ashford Communities</p><h1>${title}</h1>${bodyHtml}</main></body></html>`;
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', ...headers } });
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers },
  });
}
