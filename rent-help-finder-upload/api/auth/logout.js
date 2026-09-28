import { SESSION_COOKIE, SESSION_HOURS, cookieHeader, page } from '../_lib/session.js';

export function GET() {
  return page(
    'You’re signed out',
    `<p>For security, Rent Help Finder also signs you out ${SESSION_HOURS} hours after you sign in.</p><a class="btn" href="/api/auth/login">Sign in again</a>`,
    200,
    { 'set-cookie': cookieHeader(SESSION_COOKIE, '', 0) }
  );
}
