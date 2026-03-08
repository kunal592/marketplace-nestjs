import * as crypto from 'crypto';

/**
 * Verify Razorpay payment signature.
 *
 * @param razorpayOrderId   - The order ID returned by Razorpay
 * @param razorpayPaymentId - The payment ID returned by Razorpay
 * @param razorpaySignature - The signature returned by Razorpay
 * @param secret            - Your Razorpay secret key
 * @returns true if signature is valid
 */
export function verifyRazorpaySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    secret: string,
): boolean {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

    return expectedSignature === razorpaySignature;
}

/**
 * Verify Razorpay webhook signature.
 *
 * @param body          - Raw request body as string
 * @param signature     - X-Razorpay-Signature header value
 * @param webhookSecret - Your Razorpay webhook secret
 * @returns true if the webhook is authentic
 */
export function verifyRazorpayWebhookSignature(
    body: string,
    signature: string,
    webhookSecret: string,
): boolean {
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

    return expectedSignature === signature;
}
