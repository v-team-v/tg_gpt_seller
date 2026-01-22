import crypto from 'crypto';

interface PaymentParams {
    amount: number;
    orderId: number;
    description: string;
    email?: string;
}

const MERCHANT_LOGIN = process.env.ROBOKASSA_LOGIN || '';
const PASSWORD_1 = process.env.ROBOKASSA_PASS1 || '';
const PASSWORD_2 = process.env.ROBOKASSA_PASS2 || '';
const IS_TEST = false; // User said shop is active

export function generatePaymentUrl({ amount, orderId, description, email }: PaymentParams): string {
    // Receipt Object
    const receiptData: any = {
        sno: "usn_income",
        items: [
            {
                name: "Оформление подписки для ChatGPT",
                quantity: 1,
                sum: amount,
                price: amount,
                tax: "none",
                payment_method: "full_prepayment",
                payment_object: "service"
            }
        ]
    };

    if (email) {
        receiptData.client = { email };
    }

    const receipt = JSON.stringify(receiptData);

    // Encode Receipt using URLSearchParams to ensure it matches exactly what goes into the URL
    // (URLSearchParams uses '+' for spaces, while encodeURIComponent uses '%20')
    const receiptEncoded = new URLSearchParams({ Receipt: receipt }).get('Receipt') || '';

    // Signature: md5(MerchantLogin:OutSum:InvId:Receipt:Password#1)
    const signatureString = `${MERCHANT_LOGIN}:${amount}:${orderId}:${receiptEncoded}:${PASSWORD_1}`;
    const signature = crypto.createHash('md5').update(signatureString).digest('hex');

    const params = new URLSearchParams({
        MerchantLogin: MERCHANT_LOGIN,
        OutSum: amount.toString(),
        InvId: orderId.toString(),
        Description: description,
        SignatureValue: signature,
        Culture: 'ru',
        Receipt: receipt
    });

    if (email) {
        params.append('Email', email);
    }
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
