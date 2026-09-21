import { Resend } from 'resend';

export default async function handler(req: any, res: any) {
  // Set CORS and JSON headers
  res.setHeader?.('Access-Control-Allow-Origin', '*');
  res.setHeader?.('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader?.('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader?.('Content-Type', 'application/json');

  // Handle preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.status?.(204)?.end?.() ?? res.end?.();
  }

  // Friendly status message for GET
  if (req.method === 'GET') {
    res.statusCode = 200;
    const body = JSON.stringify({
      status: 'ok',
      message:
        'POI Contact API is running. Submit a POST request with { name, email, subject, message } to send an email.',
      configured: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_api_key_here'),
    });
    return res.status?.(200)?.send?.(body) ?? res.end?.(body);
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    const body = JSON.stringify({ error: `Method ${req.method} not allowed. Please use POST.` });
    return res.status?.(405)?.send?.(body) ?? res.end?.(body);
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      res.statusCode = 400;
      const errBody = JSON.stringify({ error: 'Invalid JSON body' });
      return res.status?.(400)?.send?.(errBody) ?? res.end?.(errBody);
    }
  }

  const { name, email, subject, message } = body || {};

  if (!name || !email || !message) {
    res.statusCode = 400;
    const errBody = JSON.stringify({ error: 'Missing required fields (name, email, message)' });
    return res.status?.(400)?.send?.(errBody) ?? res.end?.(errBody);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 're_your_api_key_here') {
    res.statusCode = 500;
    const errBody = JSON.stringify({
      error:
        'RESEND_API_KEY is not configured. Please sign up at https://resend.com, generate an API key, and set RESEND_API_KEY in your .env file. Please try again or email pvmclasen@gmail.com directly.',
    });
    return res.status?.(500)?.send?.(errBody) ?? res.end?.(errBody);
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'POI Contact Form <onboarding@resend.dev>',
      to: [process.env.RESEND_TO_EMAIL || 'pvmclasen@gmail.com'],
      replyTo: email,
      subject: `POI Inquiry from ${name}: ${subject || 'New Message'}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || 'N/A'}\n\nMessage:\n${message}`,
    });

    if (error) {
      res.statusCode = 400;
      const errBody = JSON.stringify({ error: error.message });
      return res.status?.(400)?.send?.(errBody) ?? res.end?.(errBody);
    }

    res.statusCode = 200;
    const successBody = JSON.stringify({ success: true, data });
    return res.status?.(200)?.send?.(successBody) ?? res.end?.(successBody);
  } catch (err: any) {
    res.statusCode = 500;
    const errBody = JSON.stringify({ error: err?.message || 'Internal server error while sending email' });
    return res.status?.(500)?.send?.(errBody) ?? res.end?.(errBody);
  }
}
