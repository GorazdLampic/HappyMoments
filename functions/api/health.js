/**
 * GET /api/health — Health check
 */
export async function onRequestGet(context) {
    return Response.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        db: !!context.env.DB,
        stripe: !!context.env.STRIPE_SECRET_KEY
    });
}
