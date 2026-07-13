# Database Schema

**Provider:** PostgreSQL (Neon) via Prisma ORM

---

## Enums

### Role
`customer` | `staff` | `admin`

### OrderStatus
`Received` → `Designing` → `Quoted` → `Confirmed` → `InProgress` → `Ready` → `Completed`

Cancelled can occur at any point.

### PaymentStatus
`unpaid` | `partial` | `paid`

> **Note:** Payment status tracking exists in the schema but is unused in v1. Payment integration (Chapa) is planned for v2. See [Future Features](FUTURE_FEATURES.md).

### RecoveryStatus
`pending` | `approved` | `rejected`

---

## Models

### User

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| telegramId | String | Unique |
| telegramUsername | String? | |
| telegramPhone | String? | |
| telegramPhoto | String? | |
| passwordHash | String? | bcrypt, nullable for Telegram-only users |
| name | String | |
| role | Role | Default: `customer` |
| notifyViaTelegram | Boolean | Default: true |
| createdAt | DateTime | |
| updatedAt | DateTime | |

Relations: `requests` (CustomCakeRequest[]), `reviews` (Review[]), `statusEvents` (OrderStatusEvent[])

### CustomCakeRequest

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| userId | String? | FK → User |
| contactName | String | |
| contactPhone | String | |
| eventType | String | |
| guestCount | Int | |
| deliveryOption | String? | `pickup` or `delivery` |
| deliveryAddress | String? | |
| deliveryDate | DateTime | |
| designStyle | String? | |
| flavor | String | |
| tierCount | Int | 1-6 |
| specialInstructions | String? | |
| referenceImage | String? | Cloudinary URL |
| referenceImagePublicId | String? | |
| referenceImageFormat | String? | |
| referenceImageBytes | Int? | |
| legacyContact | Json? | |
| requestDate | DateTime | |
| quotedPrice | Decimal? | **v2** — Price quoted by staff |
| finalPrice | Decimal? | **v2** — Price confirmed by customer |
| priceConfirmedAt | DateTime? | **v2** — When customer accepted price |
| depositAmount | Decimal | **v2** — Amount paid so far (default: 0) |
| depositPaidAt | DateTime? | **v2** — When first payment was made |
| remainingBalance | Decimal | **v2** — `finalPrice - depositAmount` (default: 0) |
| paymentStatus | PaymentStatus | **v2** — `unpaid` / `partial` / `paid` (default: `unpaid`) |
| status | OrderStatus | Default: `Received` |
| bakerNote | String? | |
| deletedAt | DateTime? | Soft delete |
| lastNotifiedStatus | OrderStatus? | |
| createdAt | DateTime | |
| updatedAt | DateTime | |

Indexes: `[userId, deletedAt]`, `[status, deletedAt]`

### CakeGalleryItem

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| name | String | |
| description | String | |
| categoryId | String? | FK → Category |
| flavors | String[] | |
| priceEstimate | Decimal | |
| image | String | Cloudinary URL |
| imagePublicId | String? | |
| servingCount | Int? | |
| tags | String[] | |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Category

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| name | String | |
| slug | String | Unique |
| description | String? | |
| color | String? | |
| icon | String? | |
| sortOrder | Int | Default: 0 |
| isActive | Boolean | Default: true (soft delete) |
| createdAt | DateTime | |
| updatedAt | DateTime | |

Index: `[isActive, sortOrder]`

### Review

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| rating | Int | 1-5 |
| content | String | |
| author | String | |
| eventType | String? | |
| role | String? | `Host` or `Guest` |
| userId | String? | FK → User |
| productId | String? | |
| date | DateTime | |
| createdAt | DateTime | |

### RecoveryRequest

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| oldTelegramId | String | |
| newTelegramId | String | |
| status | RecoveryStatus | Default: `pending` |
| createdAt | DateTime | |
| updatedAt | DateTime | |

Index: `[oldTelegramId, newTelegramId, status]`

### OrderStatusEvent

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| orderId | String | FK → CustomCakeRequest |
| fromStatus | OrderStatus? | |
| toStatus | OrderStatus | |
| changedById | String? | FK → User |
| source | String | |
| note | String? | |
| createdAt | DateTime | |

Indexes: `[orderId, createdAt]`, `[changedById]`

---

## Relationships Diagram

```
User ──┐
│      ├── CustomCakeRequest ──┐
│      │                       ├── OrderStatusEvent
│      ├── Review              │
│      └── OrderStatusEvent ◄──┘
│
Category ── CakeGalleryItem
```
