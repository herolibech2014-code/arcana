// api/create-order.js
// Función serverless (Vercel). Crea una orden de pago en PayPal DEL LADO DEL SERVIDOR.
// Importante: el monto (USD $2) está fijo acá, no viene del navegador — así nadie puede
// manipular el precio antes de pagar.

async function obtenerAccessToken(base, clientId, secret) {
    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
    const resp = await fetch(`${base}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    const data = await resp.json();
    if (!data.access_token) throw new Error('No se pudo obtener el token de acceso de PayPal');
    return data.access_token;
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_SECRET;
    const entorno = process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox';
    const base = entorno === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

    if (!clientId || !secret) {
        return res.status(500).json({ error: 'Faltan las variables de entorno PAYPAL_CLIENT_ID / PAYPAL_SECRET en el servidor.' });
    }

    try {
        const accessToken = await obtenerAccessToken(base, clientId, secret);

        const ordenResp = await fetch(`${base}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    description: 'Arcana — Consulta astrológica de fecha a elección',
                    amount: { currency_code: 'USD', value: '2.00' } // ← monto fijo, definido en el servidor
                }]
            })
        });

        const orden = await ordenResp.json();
        if (!orden.id) {
            console.error('Error creando orden PayPal:', orden);
            return res.status(502).json({ error: 'No se pudo crear la orden de pago.' });
        }

        return res.status(200).json({ id: orden.id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error interno creando la orden de pago.' });
    }
};
