import { createPublicClient } from '@/lib/supabase';

// GET /api/unsubscribe?email=xxx — Unsubscribe from emails
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return new Response('Email is required.', { status: 400 });
    }

    const supabase = createPublicClient();

    const { error } = await supabase
      .from('subscribers')
      .update({ is_active: false })
      .eq('email', email.trim().toLowerCase());

    if (error) throw error;

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed — Daily Motivations</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              background: #0a0a0c;
              color: #f5f0eb;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              text-align: center;
              padding: 24px;
            }
            h1 { font-size: 1.5rem; margin-bottom: 8px; }
            p { color: #9a9494; }
            a { color: #e8a87c; }
          </style>
        </head>
        <body>
          <div>
            <h1>You've been unsubscribed</h1>
            <p>We're sorry to see you go. You won't receive any more emails from us.</p>
            <p style="margin-top: 16px;"><a href="/">← Back to Daily Motivations</a></p>
          </div>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return new Response('Failed to unsubscribe.', { status: 500 });
  }
}
