/**
 * Middleware for all /api/* routes.
 * Handles CORS and request validation.
 */

const ALLOWED_ORIGINS = [
    'https://happymoments.app',
    'https://www.happymoments.app',
    'http://localhost:3000',
    'http://localhost:8788'
];

function corsHeaders(request) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
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

    // Reject oversized bodies (10KB max)
    const contentLength = context.request.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength) > 10240) {
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
