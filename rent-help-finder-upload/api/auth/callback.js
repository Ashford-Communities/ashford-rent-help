// Finishes Microsoft 365 sign-in: exchanges the code, checks the ID token, sets the session cookie.
import { STATE_COOKIE, cookieHeader, createSession, getCookie, page, verify } from '../_lib/session.js';

const fail = (msg, status = 403) =>
  page('Sign-in didn’t work', `<p>${msg}</p><a class="btn" href="/api/auth/login">Try again</a>`, status, { 'set-cookie': cookieHeader(STATE_COOKIE, '', 0) });

export async function GET(request) {
  const { AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, SESSION_SECRET } = process.env;
  const allowedDomain = (process.env.ALLOWED_EMAIL_DOMAIN || 'ashfordco.com').toLowerCase();
  const url = new URL(request.url);

  if (url.searchParams.get('error')) return fail('Microsoft sign-in was cancelled or denied.');
  const saved = await verify(getCookie(request, STATE_COOKIE), SESSION_SECRET);
  if (!saved || saved.state !== url.searchParams.get('state')) return fail('Your sign-in expired.', 400);

  const tokenRes = await fetch(`https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: AZURE_CLIENT_ID,
      client_secret: AZURE_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: url.searchParams.get('code') || '',
      redirect_uri: `${url.origin}/api/auth/callback`,
      scope: 'openid profile email',
    }),
  });
  const tokens = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok || !tokens.id_token) {
    console.error('Token exchange failed', tokenRes.status, tokens.error, tokens.error_description);
    return fail('Microsoft sign-in could not be completed.', 502);
  }

  // The ID token came straight from Microsoft's token endpoint over TLS, so we check its claims
  // (audience, tenant, nonce, expiry) rather than re-verifying the signature.
  let claims;
  try {
    const part = tokens.id_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    claims = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(part), (c) => c.charCodeAt(0))));
  } catch {
    return fail('Microsoft returned an unreadable token.', 502);
  }
  if (claims.aud !== AZURE_CLIENT_ID || claims.tid !== AZURE_TENANT_ID || claims.nonce !== saved.nonce || claims.exp * 1000 < Date.now()) {
    return fail('Microsoft returned a token for the wrong app or tenant.');
  }
  const email = String(claims.email || claims.preferred_username || '').toLowerCase();
  if (!email.endsWith(`@${allowedDomain}`)) return fail(`Only @${allowedDomain} accounts can use this tool.`);

  const headers = new Headers({ location: saved.returnTo || '/' });
  headers.append('set-cookie', await createSession({ email, name: claims.name || email }, SESSION_SECRET));
  headers.append('set-cookie', cookieHeader(STATE_COOKIE, '', 0));
  return new Response(null, { status: 302, headers });
}
