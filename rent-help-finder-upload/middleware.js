// Requires a Microsoft 365 sign-in for every page and API route except the sign-in routes themselves.
import { json, readSession } from './api/_lib/session.js';

export const config = { matcher: ['/((?!api/auth/).*)'] };

export default async function middleware(request) {
  if (await readSession(request)) return;
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) return json({ error: 'signin' }, 401);
  const login = new URL('/api/auth/login', url);
  login.searchParams.set('returnTo', url.pathname + url.search);
  return Response.redirect(login, 302);
}
