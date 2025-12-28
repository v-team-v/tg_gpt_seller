const METRICA_ID = '106059751';

interface MetricaParams {
    clientId: string;
    target: string;
    revenue?: number;
}

export async function sendMetricaHit({ clientId, target, revenue }: MetricaParams) {
    if (!clientId) return;

    try {
        const params = new URLSearchParams({
            'page-url': 'app:/payment-success',
            'browser-info': 'ServerSide:1',
            'site-info': JSON.stringify({
                renderer: 'ServerSide'
            })
        });

        // Construct the hit URL
        // https://mc.yandex.ru/watch/99122777?...
        let url = `https://mc.yandex.ru/watch/${METRICA_ID}?${params.toString()}`;

        // Add ClientID
        // We simulate a hit by passing the cookie explicitly in headers
        const cookie = `_ym_uid=${clientId};`;

        // Append goal params
        // goal-id=NAME
        url += `&goal-id=${target}`;

        if (revenue) {
            url += `&order-price=${revenue}&currency=RUB`;
        }

        // Add random to prevent caching
        url += `&rnd=${Math.random()}`;

        await fetch(url, {
            method: 'GET',
            headers: {
                'Cookie': cookie,
                'User-Agent': 'TelegramBotServer/1.0'
            }
        });

        console.log(`[Analytics] Sent goal '${target}' for client '${clientId}'`);
    } catch (e) {
        console.error('[Analytics] Failed to send metrica hit:', e);
    }
}
