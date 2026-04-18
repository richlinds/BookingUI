# Booking UI

React + TypeScript frontend for the [BookingAPI](https://github.com/RichLinds1988/BookingAPI). Built with Vite, Tailwind CSS, and React Router.

![CI](https://github.com/RichLinds1988/booking-ui/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/typescript-5-blue)
![React](https://img.shields.io/badge/react-18-61DAFB)

## Stack

- **React 18** — UI framework
- **TypeScript** — static typing throughout
- **Vite** — build tool and dev server
- **Tailwind CSS** — utility-first styling
- **React Router v6** — client-side routing
- **ESLint + Prettier** — linting and formatting

## Getting Started

### Prerequisites

- Node.js 18+
- The [BookingAPI](https://github.com/RichLinds1988/BookingAPI) running locally on port 8000

### Install and run

```bash
git clone https://github.com/RichLinds1988/BookingUI.git
cd BookingUI
cp .env.example .env
npm install
npm run dev
```

App will be available at `http://localhost:3000`.

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api` | Base URL of the booking API |

---

## Features

- **Auth** — register and login with JWT, protected routes, automatic token refresh on expiry, automatic logout when refresh token expires
- **Resources** — browse bookable resources, check availability, create bookings with guest count validation
- **My Bookings** — paginated list of your bookings, cancel confirmed bookings, displays "Unknown Resource" if resource name is unavailable
- **Admin** — create, edit, and activate/deactivate resources (admin users only)
- **Role-based access** — Admin tab and routes are hidden from non-admin users

## Project Structure

```
src/
├── api/
│   └── client.ts           # Typed API client with 401 handling and auto token refresh
├── context/
│   └── AuthContext.ts      # Auth context definition
├── components/
│   └── Layout.tsx          # Nav + page shell (admin tab shown to admins only)
├── hooks/
│   ├── useAuth.tsx         # AuthProvider — manages access + refresh tokens
│   ├── useAuthContext.ts   # useAuth() hook
│   ├── useBookings.ts      # Bookings fetch/cancel/pagination
│   └── useResources.ts     # Resources fetch/pagination
├── pages/
│   ├── AuthPage.tsx        # Login / register
│   ├── ResourcesPage.tsx   # Browse and book resources
│   ├── BookingsPage.tsx    # View and cancel bookings
│   └── AdminPage.tsx       # Resource management (admin only)
├── types/
│   └── index.ts            # Shared TypeScript interfaces including PaginatedResponse<T>
└── App.tsx                 # Router + auth guard + admin route protection
```

## Running CI Checks Locally

```bash
npx tsc --noEmit
npx eslint src/
npx prettier --check "src/**/*.{ts,tsx}"
npm run build
```

## CI

GitHub Actions runs on every push to `main`:

- **TypeScript** — `tsc --noEmit`
- **ESLint** — lint all `.ts` and `.tsx` files
- **Prettier** — formatting check
- **Build** — ensure the production build succeeds

## License

MIT