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
  "deliveryOption": "pickup",
  "deliveryAddress": "Bole, Addis Ababa",
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
Accept the quoted price for an order.

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

## Gallery

### GET /api/gallery
List gallery items. Supports `?category=slug` filtering.

### POST /api/gallery
Create gallery item.

**Auth:** Required (admin/staff)

### PATCH /api/gallery/:id
Update gallery item.

**Auth:** Required (admin/staff)

### DELETE /api/gallery/:id
Delete gallery item.

**Auth:** Required (admin/staff)

---

## Uploads

### POST /api/uploads/image
Upload an image to Cloudinary.

**Auth:** Required

**Body:** `{ "fileName": "cake.jpg", "mimeType": "image/jpeg", "size": 500000, "dataBase64": "..." }`

### DELETE /api/uploads/image
Delete image from Cloudinary.

**Auth:** Required (admin/staff)

**Body:** `{ "publicId": "..." }`

---

## Recovery

### POST /api/recovery
Create a Telegram account recovery request.

### GET /api/recovery
List all recovery requests.

**Auth:** Required (admin/staff)

### PATCH /api/recovery/:id
Approve or reject a recovery request.

**Auth:** Required (admin)

---

## Reviews

### GET /api/reviews
List all reviews.

### POST /api/reviews
Create a review.

**Auth:** Required

**Body:** `{ "rating": 5, "content": "Amazing cake!", "author": "John", "eventType": "Birthday", "role": "Host" }`

### DELETE /api/reviews/:id
Delete a review.

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
  "statusBreakdown": { "Received": 5, "Quoted": 3, ... },
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
