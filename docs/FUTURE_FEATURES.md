# Future Features

Features planned for post-v1 releases. These are designed but not yet active in the production system.

---

## Payment Integration (Chapa)

**Status:** Designed, not implemented in v1
**Target:** v2

### Overview

Online payment processing via [Chapa](https://chapa.co), an Ethiopian payment gateway. Enables customers to pay for cake orders online via mobile money, bank transfer, or card.

### Planned Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/payments/initiate` | POST | Required | Start a Chapa checkout session |
| `/api/payments/callback` | GET | None | Chapa redirect callback after payment |
| `/api/payments/webhook` | POST | None | Chapa server-side webhook |
| `/api/payments/requests/:id/record-payment` | POST | admin/staff | Record manual payment (bank transfer, cash) |

### Planned Flow

1. Staff sets `quotedPrice` on an order → status moves to `Quoted`
2. Customer accepts price → status moves to `Confirmed`
3. Customer clicks "Pay Now" → `POST /api/payments/initiate` → redirected to Chapa checkout
4. Payment completes → Chapa hits `/api/payments/webhook` → order `depositAmount` updated
5. If fully paid → `paymentStatus` changes to `paid`

### Database Fields (already in schema)

These fields exist in `CustomCakeRequest` but are unused in v1:

| Field | Type | Purpose |
|-------|------|---------|
| `quotedPrice` | Int? | Price quoted by staff |
| `finalPrice` | Int? | Price confirmed by customer |
| `priceConfirmedAt` | DateTime? | When customer accepted the price |
| `depositAmount` | Int | Amount paid so far |
| `depositPaidAt` | DateTime? | When first payment was made |
| `remainingBalance` | Int | `finalPrice - depositAmount` |
| `paymentStatus` | PaymentStatus | `unpaid` / `partial` / `paid` |

### Config Required

```env
CHAPA_SECRET_KEY=your_chapa_secret
CHAPA_WEBHOOK_SECRET=your_webhook_secret
```

### Notes

- The `payment` module exists in `src/modules/payment/` but is not routed in v1
- Mock mode is available for development (auto-verifies payments)
- Webhook signature verification is required for production

---

## Other Planned Features

### Email Notifications
- Send order status updates via email in addition to Telegram
- Require SMTP configuration

### SMS Notifications
- Integration with Ethiopian SMS providers
- Order status updates via SMS

### Multi-language Chatbot
- Amharic support for the Gemini chatbot
- Language detection and response

### Order Analytics Dashboard
- Advanced charts and reporting
- Revenue trends, popular flavors, peak seasons

### Customer Portal
- Dedicated customer dashboard with order history
- Reorder functionality
- Favorite designs

---

## How to Activate a Future Feature

1. Read the feature spec above
2. Uncomment/add the relevant route in `src/app/routes.ts`
3. Add required environment variables
4. Run database migrations if new fields are needed
5. Test thoroughly before deploying
