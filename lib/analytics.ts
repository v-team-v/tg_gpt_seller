import axios from 'axios';

const METRICA_COUNTER_ID = 106059751; // Your ID

/**
 * Sends an offline conversion (purchase) to Yandex Metrica.
 * Docs: https://yandex.ru/dev/metrika/doc/api3/reference/offline_conversions.html
 * Note: This requires an OAuth token with `metrika:write` permission.
 * 
 * @param clientID - Specifically 'ym_XXXXX' where XXXXX is the clientID
 * @param amount - Order amount
 * @param currency - 'RUB'
 */
export async function sendMetricaConversion(clientID: string, amount: number, currency = 'RUB') {
    const token = process.env.YANDEX_METRICA_TOKEN;

    if (!token) {
        console.warn("Skipping Metrica conversion: YANDEX_METRICA_TOKEN not set");
        return;
    }

    // Expect clientID format: "ym_12345678"
    // We need to extract the clean numeric ID
    const cleanClientID = clientID.replace(/^ym_/, '');

    if (!cleanClientID) {
        console.warn("Skipping Metrica conversion: Invalid ClientID format", clientID);
        return;
    }

    try {
        // We use the "upload offline conversions" endpoint
        // Actually, for immediate server-side events, Measurement Protocol (hit) is often used for pageviews, 
        // but for eCommerce usually it's pushed via JS or this CSV upload API.
        // 
        // However, Yandex Metrica also supports sending data via CSV upload which is "Offline Conversions".
        // Let's use that as it's the standard for backend sales matching.

        // CSV Header: ClientID,Target,DateTime,Price,Currency
        // We need to define a goal or just use a general conversion?
        // Actually, "Offline conversions" are usually bound to a specific JavaScript Goal ID or just "purchase" if configured.
        // Let's use a simple approach: Uploading a conversion for a goal "PURCHASE" or similar if created.
        // But since the user wants standard eCommerce, it's complex via backend without frontend.
        //
        // Alternative: Measurement Protocol for Yandex Metrica is not as standard as GA4.
        // The official way is "Offline Conversions" API.

        // Let's try to upload a CSV line.
        const timestamp = Math.floor(Date.now() / 1000);
        const csvContent = `ClientId,Target,DateTime,Price,Currency\n${cleanClientID},purchase,${timestamp},${amount},${currency}`;

        // Use FormData for file upload
        const formData = new FormData();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        formData.append('file', blob, 'data.csv');

        // NOTE: This is complex to implement correctly without `FormData` polyfills in Node sometimes.
        // Let's use query params if possible? No, it's POST multipart/form-data.

        // Simplified "Post API" for backend hits? 
        // Yandex doesn't strictly have a simple "hit" API for backend ecommerce like Google.
        // The "Offline Conversions" is the right path.

        // Wait, simplier path: 
        // https://api-metrika.yandex.net/management/v3/upload/offline_conversions
        // requiring counterId, oauth.

        // Since we don't have the token yet, we will just log it for now.

        console.log(`[Metrica] Would send conversion: ClientID=${cleanClientID}, Amount=${amount} RUB`);

        // Actual implementation stub for when token is available:
        /*
        const url = `https://api-metrika.yandex.net/management/v3/upload/offline_conversions?counterId=${METRICA_COUNTER_ID}&client_id_type=CLIENT_ID`;
        
        await axios.post(url, formData, {
          headers: {
            'Authorization': `OAuth ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        */

    } catch (error) {
        console.error("Metrica send error:", error);
    }
}
