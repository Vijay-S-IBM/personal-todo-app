# ToDo App — Frontend

React frontend for the Personal ToDo App backend (FastAPI).

## Stack

- **React 18** + Vite
- **React Router v6** — client-side routing
- **Axios** — HTTP client with JWT interceptor
- **Recharts** — pie/donut and bar charts on Statistics
- **date-fns** — date formatting and calendar maths
- **@react-oauth/google** — Google One Tap / Sign-In button
- **lucide-react** — icons
- CSS Modules — scoped styles, no extra CSS-in-JS

## Screens

| Route | Description |
|---|---|
| `/login` | Google OAuth sign-in |
| `/dashboard` | Paginated task list for a selected date — full CRUD |
| `/calendar` | Monthly calendar with per-day task counts |
| `/statistics` | Summary cards, donut chart, bar chart, breakdown table |

## Setup

1. Copy `.env` and fill in your values:
   ```
   VITE_API_URL=http://localhost:8000
   VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
   ```

2. Install and run:
   ```bash
   npm install
   npm run dev
   ```

The app will be at `http://localhost:5173`.

## Google OAuth Setup

- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create OAuth 2.0 credentials (Web application)
- Add `http://localhost:5173` to **Authorised JavaScript origins**
- Paste the Client ID into `VITE_GOOGLE_CLIENT_ID`
