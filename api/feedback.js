/**
 * POST /api/feedback — capture "what to cover next" poll votes.
 *
 * Set FEEDBACK_WEBHOOK_URL in Vercel env to a Google Apps Script web app
 * (or Zapier/Make/Formspree) that appends rows to a sheet Andrew can open.
 * Submissions are also logged to Vercel function logs.
 */
const TOPICS = new Set([
  'sriov-virt',
  'cxl-pooling',
  'retimers-si',
  'hotplug-pm',
  'acs-iommu',
  'other',
]);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const topic = String(body.topic || '').trim();
    const note = String(body.note || '').trim().slice(0, 280);

    if (!TOPICS.has(topic)) {
      res.status(400).json({ ok: false, error: 'Pick a topic' });
      return;
    }

    const payload = {
      topic,
      note: note || null,
      at: new Date().toISOString(),
      ua: String(req.headers['user-agent'] || '').slice(0, 160) || null,
    };

    console.log('[feedback]', JSON.stringify(payload));

    const webhook = process.env.FEEDBACK_WEBHOOK_URL;
    let forwarded = false;
    if (webhook) {
      const r = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      forwarded = r.ok;
      if (!r.ok) {
        console.error('[feedback] webhook status', r.status, await r.text().catch(() => ''));
      }
    }

    res.status(200).json({
      ok: true,
      forwarded,
      configured: Boolean(webhook),
    });
  } catch (err) {
    console.error('[feedback]', err);
    res.status(500).json({ ok: false, error: 'Could not save' });
  }
}
