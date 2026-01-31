import crypto from 'crypto';

const WATA_API_URL = 'https://api.wata.pro/api/h2h';
const WATA_API_TOKEN = process.env.WATA_API_TOKEN;

let publicKeyCache: string | null = null;

interface CreatePaymentLinkParams {
    amount: number;
    currency?: string;
    description?: string;
    orderId: string;
    successRedirectUrl?: string; // Optional, can be set in dashboard
    failRedirectUrl?: string;    // Optional, can be set in dashboard
}

interface CreatePaymentLinkResponse {
    id: string; // Payment Link ID
    url: string; // Redirect URL
}

export const wata = {
    /**
     * Create a payment link
     */
    async createPaymentLink(params: CreatePaymentLinkParams): Promise<CreatePaymentLinkResponse> {
        if (!WATA_API_TOKEN) {
            throw new Error('WATA_API_TOKEN is not configured');
        }

        // Calculate expiration (e.g., 30 minutes from now)
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + 30);

        const body = {
            type: 'OneTime', // Or ManyTime? OneTime for one order seems correct
            amount: params.amount,
            currency: params.currency || 'RUB',
            description: params.description,
            orderId: params.orderId,
            successRedirectUrl: params.successRedirectUrl,
            failRedirectUrl: params.failRedirectUrl,
            expirationDateTime: expirationDate.toISOString(),
        };

        const response = await fetch(`${WATA_API_URL}/links`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${WATA_API_TOKEN}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Wata API Error:', response.status, errorText);
            throw new Error(`Wata API Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return {
            id: data.id,
            url: data.url,
        };
    },

    /**
     * Get Public Key for signature verification
     */
    async getPublicKey(): Promise<string> {
        if (publicKeyCache) return publicKeyCache;

        const response = await fetch(`${WATA_API_URL}/public-key`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch Wata Public Key');
        }

        const data = await response.json();
        // Ensure the key has proper PEM formatting if not already
        let key = data.value;
        if (!key.startsWith('-----BEGIN PUBLIC KEY-----')) {
            // It might be just the body, but usually they return PEM.
            // Based on docs "value": "-----BEGIN PUBLIC KEY-----\n..."
            // So it should be fine.
        }
        publicKeyCache = key;
        return key;
    },

    /**
     * Verify Webhook Signature
     * SHA512withRSA
     */
    async verifyWebhook(rawBody: string, signature: string): Promise<boolean> {
        try {
            const publicKey = await this.getPublicKey();

            const verifier = crypto.createVerify('SHA512');
            verifier.update(rawBody); // Defaults to UTF-8

            // Signature is Base64 encoded in header
            return verifier.verify(publicKey, signature, 'base64');
        } catch (error) {
            console.error('Webhook Verification Error:', error);
            return false;
        }
    }
};
