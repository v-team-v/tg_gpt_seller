const METRICA_ID = '106059751';
const MP_TOKEN = 'c75bb3ab-9a55-4c72-8e35-20fb64e75450';

interface MetricaParams {
    clientId: string;
    target: string;
    revenue?: number;
    category?: string;
    label?: string;
}

export async function sendMetricaHit({ clientId, target, revenue, category = 'engagement', label = 'server_side' }: MetricaParams) {
    if (!clientId) return;

    try {
        // Yandex Metrica Measurement Protocol (https://yandex.ru/dev/metrika/ru/data-import/measurement-upload)
        // Uses flat parameters for Ecommerce: pa, tr, ti, pr<n>id, etc.

        const params = new URLSearchParams({
            'tid': METRICA_ID,             // Tracking ID
            'ms': MP_TOKEN,                // Token
            'cid': clientId,               // Client ID
            't': 'event',                  // Hit Type
            'ec': category,                // Event Category
            'ea': target,                  // Event Action (Goal)
            'el': label,                   // Event Label
            'dl': 'https://chatgpt-plus.ru/bot-action', // Virtual Page URL
            'cu': 'RUB',                   // Currency
        });

        if (revenue !== undefined && revenue !== null) {
            // 1. Goal Value (For "Goals" report)
            params.append('ev', revenue.toString());

            // 2. Ecommerce Transaction (For "Ecommerce" report)
            params.append('pa', 'purchase');               // Product Action
            params.append('tr', revenue.toString());       // Transaction Revenue
            params.append('ti', Date.now().toString());    // Transaction ID

            // 3. Product Details (Mandatory for pa=purchase)
            params.append('pr1id', 'subscription');
            params.append('pr1nm', 'ChatGPT Plus Subscription');
            params.append('pr1pr', revenue.toString());
            params.append('pr1qt', '1');
            params.append('pr1ca', 'Subscription');
            params.append('pr1br', 'ChatGPT Plus');
        }

        const url = 'https://mc.yandex.ru/collect';

        console.log(`[Analytics] Sending Payload: ${params.toString()}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout

        await fetch(url, {
            method: 'POST',
            body: params,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

        console.log(`[Analytics] Sent MP event '${target}' for client '${clientId}' ${revenue ? `w/ revenue ${revenue}` : ''}`);
    } catch (e) {
        console.error('[Analytics] Failed to send metrica hit:', e);
    }
}
