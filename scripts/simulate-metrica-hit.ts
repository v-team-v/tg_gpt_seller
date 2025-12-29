
import { sendMetricaHit } from '../lib/analytics';

const TARGET_CLIENT_ID = '1766939876293036547'; // Vladimir's ID from logs

async function main() {
    console.log(`[Simulation] Sending test conversion for client: ${TARGET_CLIENT_ID}`);

    await sendMetricaHit({
        clientId: TARGET_CLIENT_ID,
        target: 'payment_success',
        revenue: 777.00 // 777 RUB
    });

    console.log('[Simulation] Done!');
}

main().catch(console.error);
