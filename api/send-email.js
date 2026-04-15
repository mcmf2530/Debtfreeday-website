export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const origin = req.headers.origin || '';
  const allowed = [
    'https://debtfreeday.app',
    'https://www.debtfreeday.app',
    'https://app.debtfreeday.app',
    'https://debt-payoff-tracker-9ke8.vercel.app'
  ];
  if (origin && !allowed.some(a => origin.startsWith(a))) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { to, from, subject, html, reply_to } = req.body;
  if (!subject || !html) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: from || 'Debt Free Day <support@debtfreeday.app>',
        to: to || ['support@debtfreeday.app'],
        reply_to: reply_to || undefined,
        subject,
        html
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
