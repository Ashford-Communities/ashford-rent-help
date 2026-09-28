import { json, readSession } from '../_lib/session.js';

export async function GET(request) {
  const s = await readSession(request);
  // exp lets the page warn before the 5-hour sign-in runs out and lock itself when it does.
  return s ? json({ email: s.email, name: s.name, exp: s.exp }) : json({ error: 'signin' }, 401);
}
