# booking-ui

React + TypeScript frontend for the [booking-api](https://github.com/RichLinds1988/BookingAPI). Built with Create React App, Tailwind CSS, and React Router.

## Stack

- **React 18** — UI framework
- **TypeScript** — static typing throughout
- **Tailwind CSS** — utility-first styling
- **React Router v6** — client-side routing

## Getting Started

### Prerequisites

- Node.js 18+
- The [booking-api](https://github.com/RichLinds1988/BookingAPI) running locally on port 5000

### Install and run

```bash
git clone https://github.com/RichLinds1988/booking-ui.git
cd booking-ui
cp .env.example .env
npm install
npm run dev
```

App will be available at `http://localhost:3000`.

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:5000/api` | Base URL of the booking API |

---

## Features

- **Auth** — register and login with JWT, protected routes
- **Resources** — browse bookable resources, check availability, create bookings
- **My Bookings** — view and cancel your bookings
- **Admin** — create, edit, and activate/deactivate resources

## Project Structure

```
src/
├── api/
│   └── client.ts        # Typed API client class
├── components/
│   └── Layout.tsx       # Nav + page shell
├── hooks/
│   ├── useAuth.tsx      # Auth context + hook
│   ├── useBookings.ts   # Bookings fetch/cancel logic
│   └── useResources.ts  # Resources fetch logic
├── pages/
│   ├── AuthPage.tsx     # Login / register
│   ├── ResourcesPage.tsx
│   ├── BookingsPage.tsx
│   └── AdminPage.tsx
├── types/
│   └── index.ts         # Shared TypeScript interfaces
└── App.tsx              # Router + auth guard
```

## License

MIT
