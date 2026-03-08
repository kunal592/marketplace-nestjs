export default () => ({
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret',
        expiresIn: process.env.JWT_EXPIRES || '7d',
    },

    database: {
        url: process.env.DATABASE_URL,
    },

    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        secret: process.env.RAZORPAY_SECRET,
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    },

    platform: {
        commissionPercent: parseFloat(process.env.PLATFORM_COMMISSION_PERCENT || '10'),
    },
});
