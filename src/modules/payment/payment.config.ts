export const paymentConfig = {
  get chapaSecretKey() {
    return process.env.CHAPA_SECRET_KEY || '';
  },
  get isMockMode() {
    return !this.chapaSecretKey;
  },
  get chapaApiUrl() {
    return 'https://api.chapa.co/v1';
  },
  chapaWebhookSecret: process.env.CHAPA_WEBHOOK_SECRET || '',
  getBaseUrl: () => process.env.BASE_URL || 'http://localhost:3000',
};
