# Telegram Bot

The Flavour Bites Telegram bot allows customers to place cake orders and track their status directly from Telegram.

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message with user info |
| `/order` | Start a new cake order conversation |
| `/status` | Show active orders with current status |
| `/help` | List available commands |

## Order Conversation Flow

The `/order` command starts a multi-step conversation:

1. **Event Type** — What occasion? (Birthday, Wedding, etc.)
2. **Event Date** — When is the event? (YYYY-MM-DD)
3. **Guest Count** — How many guests? (numeric, validated)
4. **Flavor** — Cake flavor preference
5. **Tier Count** — How many tiers? (1-4)
6. **Design Style** — Description of the desired design
7. **Contact Phone** — Phone number for coordination
8. **Special Instructions** — Any additional notes

On completion, the order is saved and staff are notified via the staff group chat.

## Inline Button Callbacks

Staff and customers interact via inline keyboards:

| Callback | Action |
|----------|--------|
| `status:{orderId}:{newStatus}` | Advance order status |
| `price:{orderId}` | Prompt staff to enter a price |
| `confirm:{orderId}` | Customer confirms the price |
| `revise:{orderId}` | Customer requests price revision |

## Notifications

### Staff Notifications (Group Chat)
- New order created with details and action buttons
- Customer accepted the price
- Customer requested price revision

### Customer Notifications (Direct Message)
- **Designing**: "Your cake is being designed!"
- **Priced**: Price with Accept/Revise buttons
- **Confirmed**: Confirmation with order details
- **InProgress**: Baking started
- **Ready**: Cake ready for studio pickup
- **Cancelled**: Order cancelled

## Architecture

- **Inbound**: grammY framework (webhook-based, POST /bot/webhook)
- **Outbound**: Raw fetch API calls to Telegram Bot API
- **Conversation State**: Redis (with in-memory fallback)
- **Authentication**: Telegram Login Widget on the web frontend
