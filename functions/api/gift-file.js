/**
 * GET /api/gift-file?id=<orderId>
 * Serves the client-rendered gift design PNG that was stored in D1 at order time.
 * Printful fetches this URL as the print file. PNG (raster) renders reliably on
 * Printful, unlike live-text SVG which can come out blank.
 */

export async function onRequestGet(context) {
    const id = new URL(context.request.url).searchParams.get('id');
    if (!id) {
        return new Response('Missing id', { status: 400 });
    }

    const db = context.env.DB;
    if (!db) {
        return new Response('Storage unavailable', { status: 503 });
    }

    let row;
    try {
        row = await db.prepare('SELECT data FROM gift_files WHERE id = ?').bind(id).first();
    } catch {
        return new Response('Not found', { status: 404 });
    }
    if (!row || !row.data) {
        return new Response('Not found', { status: 404 });
    }

    // row.data is base64 PNG (no data-URL prefix)
    const bin = atob(row.data);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

    return new Response(bytes, {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
