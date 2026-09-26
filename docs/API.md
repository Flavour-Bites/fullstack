# API Reference

Base URL: `/api`

All responses return JSON with shape `{ success: boolean, data?: ..., error?: string }`.

---

## Authentication

### POST /api/auth/telegram
Telegram Login Widget authentication.

**Body:**
```json
{
  "id": 123456789,
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "photo_url": "https://t.me/i/userpic/...",
  "auth_date": 1700000000,
  "hash": "..."
}
```

**Response (new user / no password):**
```json
{ "success": true, "token": "jwt...", "user": { "id": "...", "name": "John", "role": "customer" } }
```

**Response (existing user with password):**
```json
{ "success": true, "needsPassword": true, "telegramId": "123456789" }
```

### POST /api/auth/telegram/finalize
Complete login with password after Telegram auth.

**Body:** `{ "telegramId": "123456789", "password": "..." }`

### POST /api/auth/telegram-password
Direct login with Telegram ID + password.

**Body:** `{ "telegramId": "123456789", "password": "..." }`

### POST /api/auth/password
Set a password for an authenticated user.

**Auth:** Required

**Body:** `{ "password": "..." }`

### POST /api/auth/password/verify
Verify current password.

**Auth:** Required

**Response:** `{ "success": true, "valid": boolean }`

### POST /api/auth/logout
Clears auth cookie.

### GET /api/auth/me
Returns current authenticated user.

**Auth:** Required

---

## Orders (Requests)

### GET /api/requests
List orders. Customers see only their own; staff/admin see all.

**Auth:** Required

### POST /api/requests
Create a new cake request.

**Auth:** Required

**Body:**
```json
{
  "contactName": "John",
  "contactPhone": "+251911223344",
  "eventType": "Birthday",
  "guestCount": 30,
  "deliveryDate": "2026-07-15",
  "designStyle": "Elegant white with gold accents",
  "flavor": "Vanilla with strawberry filling",
  "tierCount": 2,
  "specialInstructions": "No nuts please",
  "referenceImage": "data:image/jpeg;base64,..."
}
```

### PATCH /api/requests/:id
Update order status, pricing, or notes.

**Auth:** Required (admin/staff)

### POST /api/requests/:id/accept-price
Accept the price for an order.

**Auth:** Required

### DELETE /api/requests/:id
Soft-delete an order.

**Auth:** Required

### POST /api/requests/:id/restore
Restore a soft-deleted order.

**Auth:** Required (admin/staff)

### GET /api/requests/:id/timeline
Get order status event timeline.

**Auth:** Required

---

## Categories

### GET /api/categories
List all active categories.

### POST /api/categories
Create category.

**Auth:** Required (admin/staff)

**Body:** `{ "name": "Wedding Cakes", "slug": "wedding", "description": "...", "color": "#fff", "icon": "...", "sortOrder": 1 }`

### PATCH /api/categories/:id
Update category.

**Auth:** Required (admin/staff)

### DELETE /api/categories/:id
Soft-delete (sets `isActive = false`).

**Auth:** Required (admin/staff)

---

## Products & Bakery Catalog

The `/api/products` endpoint represents the bakery catalog (cakes, cookies, cupcakes, pastries, desserts).

### GET /api/products
List active catalog items. Supports `?category=slug` and `?includeInactive=true` (admin/staff).

### GET /api/products/:id
Get a single catalog product by ID.

### POST /api/products
Create catalog product.

**Auth:** Required (admin/staff)

### PATCH /api/products/:id
Update catalog product (e.g. title, price, category, `isActive`).

**Auth:** Required (admin/staff)

### DELETE /api/products/:id
Delete catalog product. Permanently cascading removes product reviews (`onDelete: Cascade`).

**Auth:** Required (admin/staff)

### GET /api/products/:id/reviews
List approved customer reviews for a specific product.

### POST /api/products/:id/reviews
Submit a customer review for a specific product.

**Auth:** Required

**Body:** `{ "rating": 5, "content": "Best cupcakes ever!", "author": "Sara", "eventType": "Birthday", "role": "Host" }`

---

## Reviews (Company Testimonials & Moderation)

### GET /api/reviews
List general company-wide testimonials (`productId: null`).

### POST /api/reviews
Submit a company-wide review/testimonial.

**Auth:** Required

**Body:** `{ "rating": 5, "content": "Flavour Bites is fantastic!", "author": "John", "eventType": "Bakery Order", "role": "Customer" }`

### DELETE /api/reviews/:id
Delete a review (moderation for abusive/inappropriate language). Note: To protect review integrity and authenticity, admins **cannot** edit customer review text or ratings; only moderation deletion is supported.

**Auth:** Required (admin)

---

## Users

### GET /api/users
List all users.

**Auth:** Required (admin)

### PATCH /api/users/:id
Update user role.

**Auth:** Required (admin)

**Body:** `{ "role": "staff" }`

### DELETE /api/users/:id
Delete a user.

**Auth:** Required (admin)

---

## Stats

### GET /api/stats
Get admin dashboard statistics.

**Auth:** Required (admin/staff)

**Response:**
```json
{
  "totalRevenue": 150000,
  "paidOrders": 42,
  "avgOrderValue": 3571,
  "totalOrders": 58,
  "avgRating": 4.8,
  "statusBreakdown": { "Received": 5, "Priced": 3, ... },
  "roleCounts": { "customer": 85, "staff": 3, "admin": 1 },
  "totalUsers": 89,
  "totalReviews": 23
}
```

---

## Chatbot

### POST /api/chat
Send messages to the AI assistant (Gemini).

**Body:**
```json
{
  "messages": [
    { "role": "user", "text": "What cake flavors do you offer?" }
  ]
}
```

---

## Future Features

Payment endpoints (Chapa integration) are planned for v2. See [Future Features](FUTURE_FEATURES.md) for details.
