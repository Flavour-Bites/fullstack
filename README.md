# Flavour Bites

**Designed for moments worth celebrating.** A full-stack custom bakery order management system for a celebration cake business based in Addis Ababa, Ethiopia.

---

## Features

- **Online Ordering** — Custom cake request form with image upload
- **Telegram Bot** — Place orders and track status directly from Telegram
- **Admin Dashboard** — Manage orders, users, gallery, categories, reviews
- **AI Assistant** — Gemini-powered chatbot for customer inquiries
- **Staff Notifications** — Real-time Telegram alerts for new orders and status changes
- **Gallery** — Browse cake designs with category filtering
- **i18n** — English and Amharic language support
- **Dark Mode** — Light/dark theme toggle

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, TailwindCSS 4, Vite 6 |
| Backend | Express 4, Node.js (ESM) |
| Database | PostgreSQL (Neon), Prisma ORM |
| Auth | JWT, bcrypt, Telegram Login Widget |
| Bot | grammY (Telegram) |
| AI | Google Gemini 2.0 Flash |
| Media | Cloudinary |
| Cache | Redis (with in-memory fallback) |

## Quick Start

```bash
npm install
npx prisma generate && npx prisma db push
npm run db:seed
npm run dev
```

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | System design, project structure, module pattern |
| [API Reference](docs/API.md) | All endpoints, request/response schemas |
| [Database Schema](docs/DATABASE.md) | Prisma models, enums, relationships |
| [Frontend](docs/FRONTEND.md) | Components, routing, i18n, styling |
| [Telegram Bot](docs/TELEGRAM_BOT.md) | Commands, conversation flow, notifications |
| [Deployment](docs/DEPLOYMENT.md) | Environment setup, build, production deploy |
| [Future Features](docs/FUTURE_FEATURES.md) | Planned features (payments, email, SMS, etc.) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build frontend + bundle server for production |
| `npm start` | Start production server |
| `npm test` | Run all tests |
| `npm run lint` | TypeScript type check |
| `npm run db:seed` | Seed database with sample data |

## Project Structure

```
src/
├── app/           Express app, middleware, config
├── modules/       Domain modules (auth, orders, users, ...)
├── integrations/  External services (Telegram, Redis, Cloudinary, Gemini)
├── bot/           Telegram bot handlers
├── components/    React UI components
├── shared/        Error classes, utilities
└── i18n/          Translations (en, am)
```

## License

Private — Flavour Bites
