const METRICA_ID = '106059751';
const MP_TOKEN = 'c75bb3ab-9a55-4c72-8e35-20fb64e75450';

interface MetricaParams {
    clientId: string;
    target: string; // The Goal ID / Target Name (e.g. 'bot_start', 'payment_success')
    revenue?: number; // Goal Value
    label?: string;   // Event Label
    action?: 'purchase'; // Ecommerce Action (optional, for manual sending)
    productName?: string;
}

export async function sendMetricaHit({ clientId, target, revenue, label = 'server_side', action, productName }: MetricaParams) {
    if (!clientId) return;

    try {
        // Yandex Metrica Measurement Protocol
        // https://yandex.ru/dev/metrika/ru/data-import/measurement-upload

        const params = new URLSearchParams({
            'tid': METRICA_ID,             // Tracking ID
            'ms': MP_TOKEN,                // Token
            'cid': clientId,               // Client ID
            't': 'event',                  // Hit Type
            'ec': 'bot',                   // Event Category (hardcoded to 'bot' to group them)
            'ea': target,                  // Event Action (This is the Goal ID usually matched in Metrika)
            'el': label,                   // Event Label
            'dl': 'https://gpt-plus.pro/bot-action', // Virtual Page URL
            'cu': 'RUB',                   // Currency
        });

        // 1. Goal Value (For "Goals" report) - mapped to 'ev'
        if (revenue !== undefined && revenue !== null) {
            params.append('ev', revenue.toString());
        }

        // 2. Ecommerce (Optional, for manual 'purchase')
        if (action === 'purchase') {
            params.append('pa', 'purchase');
            params.append('tr', (revenue || 0).toString());
            params.append('ti', Date.now().toString());
            params.append('cu', 'RUB'); // Currency

            // Product Details (Assuming single product)
            params.append('pr1id', 'subscription'); // SKU
            params.append('pr1nm', productName || 'ChatGPT Plus Subscription');
            params.append('pr1ca', 'Subscription');
            params.append('pr1br', 'ChatGPT Plus');
            params.append('pr1qt', '1');
            if (revenue) {
                params.append('pr1pr', revenue.toString());
            }
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
