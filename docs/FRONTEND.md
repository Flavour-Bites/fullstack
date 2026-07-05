# Frontend

## Tech Stack

- **React 19** with TypeScript
- **Vite 6** (build tool, dev server with HMR)
- **TailwindCSS 4** via `@tailwindcss/vite`
- **Motion** (animations)
- **Lucide React** (icons)
- **Custom i18n** (English / Amharic)

## Components

| Component | Route | Description |
|-----------|-------|-------------|
| `HomeView` | `/` | Landing page with hero, stats, specialties, process |
| `GalleryView` | `/gallery` | Cake gallery with category filter, search, lightbox |
| `RequestFormView` | `/request` | Custom cake order form |
| `AboutView` | `/about` | About the baker, ingredients, values |
| `TestimonialsView` | `/testimonials` | Customer reviews grid |
| `ContactView` | `/contact` | Contact info, FAQ, studio policies |
| `ProfileView` | `/profile` | User profile, order tracking |
| `MyOrdersView` | `/orders` | User's orders list |
| `AdminView` | `/admin` | Dashboard, order management, users, menu |
| `AuthView` | `/auth` | Telegram login + password sign-in |
| `CakeAssistantBot` | (floating) | AI chatbot panel powered by Gemini |
| `Toast` | (provider) | Toast notification system |

## Routing

Client-side routing via React state in `App.tsx`. The app shell includes:
- Header with navigation + dark mode toggle
- Main content area
- Footer

## State Management

- **Auth state**: `useState` + localStorage for user info and token
- **Admin mode**: Separate state in `App.tsx`
- **Dark mode**: CSS class toggling on root element
- **API calls**: Direct fetch to `/api/*` endpoints via `apiClient` utility

## Internationalization

Two locales supported:
- **English** (`en`) — default
- **Amharic** (`am`) — full translation

Usage:
```tsx
const { t, locale, setLocale } = useTranslation();
t('common.welcome');       // "Welcome to Flavour Bites"
t('order.guestCount', { n: 30 });  // "30 guests"
```

## API Client

```ts
import { apiFetch } from '../shared/utils/apiClient';

const data = await apiFetch('/api/requests', {
  method: 'POST',
  body: JSON.stringify(orderData),
  token: userToken,
});
```

## Styling

- TailwindCSS utility classes throughout
- Dark mode via `dark` class on `<html>`
- Toast notifications for user feedback
- Responsive design (mobile-first)
