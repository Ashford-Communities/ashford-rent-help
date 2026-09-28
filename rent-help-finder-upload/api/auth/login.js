// Starts Microsoft 365 sign-in (OpenID Connect authorization code flow).
import { STATE_COOKIE, cookieHeader, page, randomToken, sign } from '../_lib/session.js';

export async function GET(request) {
  const { AZURE_TENANT_ID, AZURE_CLIENT_ID, SESSION_SECRET } = process.env;
  if (!AZURE_TENANT_ID || !AZURE_CLIENT_ID || !SESSION_SECRET) {
    return page('Sign-in isn’t set up yet', '<p>Set AZURE_TENANT_ID, AZURE_CLIENT_ID and SESSION_SECRET in Vercel, then redeploy.</p>', 500);
  }
  const url = new URL(request.url);
  const raw = url.searchParams.get('returnTo') || '/';
  const returnTo = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
  const state = randomToken();
  const nonce = randomToken();

  const authorize = new URL(`https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/authorize`);
  authorize.search = new URLSearchParams({
    client_id: AZURE_CLIENT_ID,
    response_type: 'code',
    redirect_uri: `${url.origin}/api/auth/callback`,
    response_mode: 'query',
    scope: 'openid profile email',
    // Ask for credentials every time, so the 5-hour limit means a real new sign-in.
    prompt: 'login',
    state,
    nonce,
  });

  const stateToken = await sign({ state, nonce, returnTo, exp: Date.now() + 10 * 60e3 }, SESSION_SECRET);
  return new Response(null, {
    status: 302,
    headers: { location: authorize.toString(), 'set-cookie': cookieHeader(STATE_COOKIE, stateToken, 600) },
  });
}
