import { defineConfig, loadEnv } from 'vite';
import { Resend } from 'resend';
import type { Connect } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const contactMiddleware: Connect.NextHandleFunction = (req, res, next) => {
    // Only handle exact /api/contact or /api/contact/
    const url = req.url?.split('?')[0] || '';
    if (url !== '' && url !== '/') {
      return next();
    }

    // Set CORS and JSON headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    // Friendly health/status check for GET requests
    if (req.method === 'GET') {
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          status: 'ok',
          message:
            'POI Contact API is running. Submit a POST request with { name, email, subject, message } to send an email.',
          configured: Boolean(env.RESEND_API_KEY || process.env.RESEND_API_KEY),
        })
      );
      return;
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end(JSON.stringify({ error: `Method ${req.method} not allowed. Please use POST.` }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const { name, email, subject, message } = JSON.parse(body || '{}');

        if (!name || !email || !message) {
          res.statusCode = 400;
          res.end(
            JSON.stringify({ error: 'Missing required fields (name, email, message)' })
          );
          return;
        }

        const apiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;
        if (!apiKey || apiKey === 're_your_api_key_here') {
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              error:
                'RESEND_API_KEY is not configured. Please sign up at https://resend.com, generate an API key, and set RESEND_API_KEY in your .env file. Please try again or email pvmclasen@gmail.com directly.',
            })
          );
          return;
        }

        const resend = new Resend(apiKey);
        const { data, error } = await resend.emails.send({
          from:
            env.RESEND_FROM_EMAIL ||
            process.env.RESEND_FROM_EMAIL ||
            'POI Contact Form <onboarding@resend.dev>',
          to: [env.RESEND_TO_EMAIL || process.env.RESEND_TO_EMAIL || 'pvmclasen@gmail.com'],
          replyTo: email,
          subject: `POI Inquiry from ${name}: ${subject || 'New Message'}`,
          text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || 'N/A'}\n\nMessage:\n${message}`,
        });

        if (error) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: error.message }));
          return;
        }

        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, data }));
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err?.message || 'Internal server error' }));
      }
    });
  };

  return {
    plugins: [
      {
        name: 'api-contact-handler',
        configureServer(server) {
          server.middlewares.use('/api/contact', contactMiddleware);
        },
        configurePreviewServer(server) {
          server.middlewares.use('/api/contact', contactMiddleware);
        },
      },
    ],
  };
});
