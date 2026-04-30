# Pangisha Frontend

React 18 · React Router v6 · Vite · No UI library

---

## Quick start

### 1. Install dependencies
```bash
npm install
```

### 2. Create your `.env` file
```bash
cp .env.example .env
```
In development, `VITE_API_URL` can stay as `http://localhost:5000/api` — Vite's proxy handles it automatically.

### 3. Make sure the backend is running
```bash
# In the pangisha-v2 folder:
npm run dev     # starts on http://localhost:5000
```

### 4. Start the frontend
```bash
npm run dev     # starts on http://localhost:5173
```

### 5. Build for production
```bash
npm run build   # outputs to dist/
```

---

## Project structure

```
pangisha-frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   ├── client.js       # Central fetch wrapper + JWT auth
│   │   ├── auth.js         # register, login, getMe
│   │   ├── listings.js     # getAll, getOne, getMine, create, update, delete, uploadImages
│   │   ├── inquiries.js    # send, getReceived, getSent, markRead
│   │   ├── users.js        # getProfile, updateProfile, changePassword
│   │   └── admin.js        # stats, listings, users, reports
│   ├── context/
│   │   └── AuthContext.jsx # Global auth state + login/logout/register
│   ├── pages/
│   │   ├── PangishaHome.jsx      # Home + search (EN/SW)
│   │   ├── AuthPage.jsx          # Login + Register
│   │   ├── ListingDetail.jsx     # Single listing + inquiry form
│   │   ├── PostListing.jsx       # 4-step landlord form + image upload
│   │   ├── LandlordDashboard.jsx # My listings + inquiry inbox (EN/SW)
│   │   ├── SavedListings.jsx     # Bookmarked listings (EN/SW)
│   │   └── AdminPanel.jsx        # Listings, users, reports (EN/SW)
│   ├── utils/
│   │   └── useFetch.js     # Reusable data fetching hook
│   ├── App.jsx             # Router + route guards
│   ├── main.jsx            # React entry point
│   └── index.css           # Global reset + CSS variables
├── index.html
├── vite.config.js
├── .env.example
└── package.json
```

---

## Pages & routes

| Route | Page | Auth required |
|-------|------|---------------|
| `/` | Home / Search | No |
| `/auth` | Login + Register | No |
| `/listing/:id` | Listing detail + inquiry | No |
| `/saved` | Saved listings | Logged in |
| `/post` | Post a listing | Landlord |
| `/dashboard` | Landlord dashboard | Landlord |
| `/admin` | Admin panel | Admin only |

---

## How auth works

1. User logs in → backend returns `{ token, user }`
2. Token stored in `localStorage` as `pangisha_token`
3. Every API request in `src/api/client.js` automatically attaches `Authorization: Bearer <token>`
4. `AuthContext` restores session on page refresh by calling `GET /api/auth/me`
5. Protected routes check `useAuth()` and redirect to `/auth` if not logged in

---

## Test accounts (from seed data)

```
Admin    → admin@pangisha.co.tz  / password123
Landlord → amina@example.com     / password123
Landlord → grace@example.com     / password123
Tenant   → hassan@example.com    / password123
Tenant   → fatuma@example.com    / password123
```

---

## Deployment to Vercel

1. Push to GitHub
2. New project on vercel.com → import repo
3. Framework preset: **Vite**
4. Add environment variable:
   ```
   VITE_API_URL = https://your-backend.onrender.com/api
   ```
5. Deploy — Vercel handles the build automatically

---

## Notes

- **Language switching** — EN/SW toggle available on Home, Dashboard, Saved, Admin pages
- **Saved listings** — stored in `localStorage` for MVP (no backend model needed)
- **Image upload** — uses native `<input type="file">` + FormData sent to Cloudinary via backend
- **WhatsApp contact** — opens `wa.me/` link directly with landlord's phone number
- **Admin panel** — only accessible if `user.role === "ADMIN"`, redirects home otherwise
