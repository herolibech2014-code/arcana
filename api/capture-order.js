// api/capture-order.js
// Función serverless (Vercel). Captura el pago en PayPal y verifica DEL LADO DEL SERVIDOR
// que se haya completado, por el monto y la moneda correctos, antes de darle el visto bueno
// al frontend. El frontend nunca decide por sí solo si el pago fue válido.

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

    let body = req.body;
    if (!body || typeof body === 'string') {
        try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; }
    }
    const orderID = body.orderID;
    if (!orderID) {
        return res.status(400).json({ error: 'Falta el orderID' });
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

        const captureResp = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const captura = await captureResp.json();

        const estado = captura.status;
        const pago = captura.purchase_units && captura.purchase_units[0] && captura.purchase_units[0].payments && captura.purchase_units[0].payments.captures && captura.purchase_units[0].payments.captures[0];
        const monto = pago && pago.amount && pago.amount.value;
        const moneda = pago && pago.amount && pago.amount.currency_code;

        const pagoValido = estado === 'COMPLETED' && pago && pago.status === 'COMPLETED' && parseFloat(monto) >= 2.00 && moneda === 'USD';

        if (pagoValido) {
            return res.status(200).json({ ok: true });
        } else {
            console.warn('Pago no válido o incompleto:', JSON.stringify(captura));
            return res.status(402).json({ ok: false, error: 'El pago no se pudo confirmar.' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, error: 'Error interno verificando el pago.' });
    }
};
