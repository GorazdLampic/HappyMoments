/**
 * GET /api/gift-design?value=10000&unit=days&name=Anna&message=Happy!&type=mug
 * Returns an SVG image that Printful can fetch as a design file.
 * This URL is publicly accessible — Printful downloads it during order creation.
 */

export async function onRequestGet(context) {
    const url = new URL(context.request.url);
    const value = url.searchParams.get('value') || '10000';
    const unit = url.searchParams.get('unit') || 'days';
    const name = url.searchParams.get('name') || '';
    const message = url.searchParams.get('message') || '';
    const type = url.searchParams.get('type') || 'mug';

    // Design dimensions per product type
    const sizes = {
        mug:    { w: 2700, h: 1100 },
        poster: { w: 3600, h: 5400 },
        tshirt: { w: 4500, h: 5400 },
        tote:   { w: 3600, h: 3600 },
        canvas: { w: 3000, h: 3000 }
    };

    const dims = sizes[type] || sizes.mug;
    const W = dims.w;
    const H = dims.h;

    const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    // Format the number nicely
    const val = Number(value) ? Number(value).toLocaleString('en-US') : value;

    // Responsive font sizes based on product dimensions
    const numLen = val.replace(/,/g, '').length;
    const fontSize = numLen > 9 ? Math.floor(H * 0.12) : numLen > 6 ? Math.floor(H * 0.16) : Math.floor(H * 0.22);
    const unitSize = Math.floor(H * 0.06);
    const nameSize = Math.floor(H * 0.05);
    const msgSize = Math.floor(H * 0.04);
    const brandSize = Math.floor(H * 0.025);

    // For mugs (wide/short), adjust layout
    const isMug = type === 'mug';
    const nameY = isMug ? '30%' : '28%';
    const numY = isMug ? '55%' : '50%';
    const unitY = isMug ? '70%' : '60%';
    const msgY = isMug ? '82%' : '72%';
    const brandY = isMug ? '95%' : '92%';

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1a1a1a"/>
      <stop offset="100%" stop-color="#2a2233"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Border accent -->
  <rect x="30" y="30" width="${W-60}" height="${H-60}" fill="none" stroke="#d4b876" stroke-width="2" opacity="0.2" rx="8"/>

  <!-- Corner accents -->
  <g opacity="0.15" stroke="#d4b876" stroke-width="3" fill="none">
    <path d="M60,100 L60,60 L100,60"/>
    <path d="M${W-100},60 L${W-60},60 L${W-60},100"/>
    <path d="M60,${H-100} L60,${H-60} L100,${H-60}"/>
    <path d="M${W-100},${H-60} L${W-60},${H-60} L${W-60},${H-100}"/>
  </g>

  <!-- Top: HappyMoments brand -->
  <text x="${W/2}" y="${Math.floor(H*0.12)}" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="${Math.floor(H*0.035)}"
        fill="#888888" font-style="italic">HappyMoments</text>

  <!-- Decorative line -->
  <line x1="${W*0.2}" y1="${Math.floor(H*0.15)}" x2="${W*0.8}" y2="${Math.floor(H*0.15)}"
        stroke="#888888" stroke-width="1" opacity="0.3"/>

  <!-- Person name -->
  ${name ? `<text x="${W/2}" y="${nameY}" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="${nameSize}"
        fill="#a0b8a0" font-style="italic">${esc(name)}</text>` : ''}

  <!-- THE NUMBER (star of the design) -->
  <text x="${W/2}" y="${numY}" text-anchor="middle"
        font-family="'Courier New', Courier, monospace" font-size="${fontSize}"
        fill="#d4b876" font-weight="300">${esc(val)}</text>

  <!-- Unit -->
  <text x="${W/2}" y="${unitY}" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="${unitSize}"
        fill="#e0e0e0" font-style="italic">${esc(unit)}</text>

  <!-- Personal message -->
  ${message ? `<text x="${W/2}" y="${msgY}" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="${msgSize}"
        fill="#888888" font-style="italic">${esc(message)}</text>` : ''}

  <!-- Decorative line bottom -->
  <line x1="${W*0.2}" y1="${Math.floor(H*0.88)}" x2="${W*0.8}" y2="${Math.floor(H*0.88)}"
        stroke="#888888" stroke-width="1" opacity="0.3"/>

  <!-- Footer -->
  <text x="${W/2}" y="${brandY}" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="${brandSize}"
        fill="#888888">happymoments.app</text>
</svg>`;

    return new Response(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
