// Past-due balances by unit for one property, pulled from the Entrata API.
// Returns lease id, unit, status and amounts only. Resident names never leave this function.
import { json, readSession } from './_lib/session.js';

const pad = (n) => String(n).padStart(2, '0');
const mmddyyyy = (d) => `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;

// Field names only (never values), for troubleshooting when the unit can't be found.
function keyPaths(obj, prefix = '', depth = 0, out = []) {
  if (!obj || typeof obj !== 'object' || depth > 4) return out;
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') keyPaths(Array.isArray(v) ? v[0] : v, path, depth + 1, out);
    else out.push(path);
  }
  return out;
}

// "Building-Unit", e.g. 1-113. getLeases returns the unit number as unitNumberSpace.
function unitLabel(lease) {
  const unit = String(lease.unitNumberSpace ?? lease.unitNumber ?? '').trim();
  const building = String(lease.buildingName ?? '').trim();
  if (!unit) return '';
  return building && !unit.startsWith(`${building}-`) ? `${building}-${unit}` : unit;
}

async function entrata(service, method, params) {
  const base = (process.env.ENTRATA_BASE_URL || '').trim().replace(/\/+$/, '');
  // Username + password (basic auth) wins when set; otherwise use the API key.
  const user = (process.env.ENTRATA_USERNAME || '').trim();
  const basic = user && process.env.ENTRATA_PASSWORD;
  const headers = { 'content-type': 'application/json; charset=utf-8' };
  if (basic) headers.authorization = `Basic ${btoa(`${user}:${process.env.ENTRATA_PASSWORD}`)}`;
  else headers['X-Api-Key'] = (process.env.ENTRATA_API_KEY || '').trim();
  const res = await fetch(`${base}/${service}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ auth: { type: basic ? 'basic' : 'apikey' }, requestId: String(Date.now()), method: { name: method, version: 'r1', params } }),
  });
  const body = await res.json().catch(() => null);
  const r = body && body.response;
  if (!res.ok || !r || r.error) {
    throw new Error(`${method} failed (${res.status}): ${(r && r.error && r.error.message) || 'no response body'}`);
  }
  return [].concat((r.result && r.result.leases && r.result.leases.lease) || []);
}

export async function GET(request) {
  if (!(await readSession(request))) return json({ error: 'signin' }, 401);
  const hasCreds = process.env.ENTRATA_API_KEY || (process.env.ENTRATA_USERNAME && process.env.ENTRATA_PASSWORD);
  if (!process.env.ENTRATA_BASE_URL || !hasCreds) {
    return json({ error: 'Entrata is not configured. Set ENTRATA_BASE_URL plus ENTRATA_API_KEY (or ENTRATA_USERNAME and ENTRATA_PASSWORD) in Vercel.' }, 500);
  }
  const propertyId = new URL(request.url).searchParams.get('propertyId') || '';
  if (!/^\d{1,12}$/.test(propertyId)) return json({ error: 'Bad propertyId' }, 400);

  try {
    const from = mmddyyyy(new Date(Date.now() - 365 * 864e5));
    const [leases, ar] = await Promise.all([
      entrata('leases', 'getLeases', { propertyId, leaseStatusTypeIds: process.env.ENTRATA_LEASE_STATUS_IDS || '4' }),
      entrata('artransactions', 'getLeaseArTransactions', { propertyId, transactionFromDate: from, showFullLedger: '0' }),
    ]);

    const units = {};
    let warned = false;
    for (const l of leases) {
      const unit = unitLabel(l);
      if (!unit && !warned) {
        console.warn('getLeases: no unit field found; field names =', keyPaths(l).join(', '));
        warned = true;
      }
      units[String(l.id)] = { unit, status: l.leaseStatusType || l.status || 'Current' };
    }

    const rows = ar
      .map((x) => {
        const L = [].concat((x.ledgers && x.ledgers.ledger) || []);
        return {
          lease: String(x.id),
          past: L.reduce((a, l) => a + (+l.pastDueBalance || 0), 0),
          bal: L.reduce((a, l) => a + (+l.balance || 0), 0),
        };
      })
      .filter((x) => units[x.lease])
      .map((x) => ({ ...x, ...units[x.lease] }));

    return json({ propertyId, pulledAt: new Date().toISOString(), rows });
  } catch (err) {
    console.error('Entrata request failed:', err.message);
    return json({ error: 'Entrata request failed' }, 502);
  }
}
