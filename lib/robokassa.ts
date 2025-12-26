import crypto from 'crypto';

interface PaymentParams {
    amount: number;
    orderId: number;
    description: string;
}

const MERCHANT_LOGIN = process.env.ROBOKASSA_LOGIN || '';
const PASSWORD_1 = process.env.ROBOKASSA_PASS1 || '';
const PASSWORD_2 = process.env.ROBOKASSA_PASS2 || '';
const IS_TEST = false; // User said shop is active

export function generatePaymentUrl({ amount, orderId, description }: PaymentParams): string {
    // Signature: md5(MerchantLogin:OutSum:InvId:Password#1)
    const signatureString = `${MERCHANT_LOGIN}:${amount}:${orderId}:${PASSWORD_1}`;
    const signature = crypto.createHash('md5').update(signatureString).digest('hex');

    const params = new URLSearchParams({
        MerchantLogin: MERCHANT_LOGIN,
        OutSum: amount.toString(),
        InvId: orderId.toString(),
        Description: description,
        SignatureValue: signature,
        // Optional: Culture, Email, etc.
        Culture: 'ru',
    });

    if (IS_TEST) {
        params.append('IsTest', '1');
    }

    return `https://auth.robokassa.ru/Merchant/Index.aspx?${params.toString()}`;
}

export function validateSignature(amount: string, orderId: string, signature: string): boolean {
    // Signature: md5(OutSum:InvId:Password#2)
    const signatureString = `${amount}:${orderId}:${PASSWORD_2}`;
    const mySignature = crypto.createHash('md5').update(signatureString).digest('hex');

    // Case-insensitive comparison
    return mySignature.toLowerCase() === signature.toLowerCase();
}
