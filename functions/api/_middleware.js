/**
 * Middleware for all /api/* routes.
 * Handles CORS and request validation.
 */

const ALLOWED_ORIGINS = [
    'https://nicenumbers.app',
    'https://www.nicenumbers.app',
    'https://happymoments.app',
    'https://www.happymoments.app',
    // Capacitor native WebView origins (Android androidScheme:https → https://localhost,
    // iOS → capacitor://localhost). Needed so the app's /api/* calls aren't CORS-blocked.
    'https://localhost',
    'capacitor://localhost',
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:8788'
];

// Cloudflare Pages branch previews: <branch>.happymoments.pages.dev
const PREVIEW_ORIGIN = /^https:\/\/[a-z0-9-]+\.happymoments\.pages\.dev$/;

function corsHeaders(request) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (ALLOWED_ORIGINS.includes(origin) || PREVIEW_ORIGIN.test(origin))
        ? origin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
    };
}

export async function onRequest(context) {
    // Handle CORS preflight
    if (context.request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders(context.request) });
    }

    // Reject oversized bodies
    // Gift orders carry base64 design images, so allow up to 10MB for /api/gift-order
    // All other routes: 10KB max
    const url = new URL(context.request.url);
    const isGiftOrder = url.pathname === '/api/gift-order';
    const maxSize = isGiftOrder ? 10 * 1024 * 1024 : 10240;

    const contentLength = context.request.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength) > maxSize) {
        return new Response(JSON.stringify({ error: 'Request too large' }), {
            status: 413,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(context.request) }
        });
    }

    // Continue to the actual handler
    const response = await context.next();

    // Add CORS headers to all responses
    const newResponse = new Response(response.body, response);
    for (const [key, value] of Object.entries(corsHeaders(context.request))) {
        newResponse.headers.set(key, value);
    }
    return newResponse;
}
