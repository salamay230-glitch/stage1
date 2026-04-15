# AXYS full-stack authentication

## Folder structure

```
stage1/
├── SETUP.md
├── backend/                          # Laravel 12 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   ├── AuthController.php
│   │   │   │   └── HomeController.php
│   │   │   ├── Middleware/
│   │   │   │   └── EnsureUserHasRole.php
│   │   │   └── Resources/
│   │   │       └── UserResource.php
│   │   └── Models/User.php
│   ├── config/
│   │   ├── cors.php
│   │   └── sanctum.php
│   ├── database/
│   │   ├── migrations/               # users, sanctum tokens, role column
│   │   └── seeders/DatabaseSeeder.php
│   └── routes/api.php
└── frontend/                         # React (Vite)
    ├── index.html
    ├── vite.config.js
    ├── public/
    └── src/
        ├── api/axios.js              # Base URL + Bearer + 401 handling
        ├── app/store.js
        ├── components/AxysLogo.jsx
        ├── features/auth/authSlice.js
        ├── pages/
        │   ├── LoginPage.jsx
        │   └── HomePage.jsx
        ├── routes/
        │   ├── GuestRoute.jsx
        │   └── PrivateRoute.jsx
        ├── utils/authStorage.js
        ├── App.jsx
        ├── main.jsx
        └── index.css
```

## Prerequisites

- PHP 8.2+, Composer
- Node.js 20+ (LTS recommended)
- MySQL / MariaDB, or SQLite for local development

## Backend setup

```powershell
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

Configure `.env` database (`DB_*`). For SQLite:

```env
DB_CONNECTION=sqlite
# DB_HOST=127.0.0.1
```

Then create the file `database/database.sqlite` if it does not exist.

Run migrations and seed demo users:

```powershell
php artisan migrate
php artisan db:seed
```

Demo accounts (password **`password`** for both):

| Email             | Role           |
| ----------------- | -------------- |
| admin@example.com | admin          |
| user@example.com  | collaborateur  |

Start the API:

```powershell
php artisan serve
```

Default API base: `http://127.0.0.1:8000`.

## Frontend setup

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

`frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Production build:

```powershell
npm run build
npm run preview
```

## CORS and Sanctum

`backend/config/cors.php` allows the Vite dev origin (`http://localhost:5173` and `http://127.0.0.1:5173`). Add your production SPA URL when you deploy.

`backend/config/sanctum.php` `stateful` domains include port `5173` for optional cookie-based flows. This project uses **Bearer API tokens** issued on login; the SPA stores the token in `localStorage` (remember me) or `sessionStorage` (session-only).

## API contract

**POST** `/api/login`

Body (JSON):

```json
{
  "email": "admin@example.com",
  "password": "password",
  "remember": true
}
```

Success **200**:

```json
{
  "token": "1|…",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "email_verified_at": null,
    "created_at": "…",
    "updated_at": "…"
  }
}
```

Invalid credentials: **422** with Laravel validation errors on `email`.

**POST** `/api/logout` — header `Authorization: Bearer {token}`. Revokes the current token.

**GET** `/api/home` — `auth:sanctum`. Returns `{ "user": { … } }` (`UserResource`).

**GET** `/api/admin/ping` — `auth:sanctum` + `role:admin`. Returns **403** for non-admins (RBAC example).

## Security notes

- Passwords are hashed with bcrypt (`casts` on `User`).
- Tokens are Sanctum personal access tokens with expiry (30 days if “remember me”, otherwise 12 hours).
- Previous `api` tokens for the same user are revoked on new login.
- API routes that require authentication use the `auth:sanctum` middleware.
- Input validation is applied in `AuthController` and errors use appropriate HTTP status codes.

## End-to-end check

1. Start Laravel (`php artisan serve`) and the Vite dev server (`npm run dev`).
2. Open `http://localhost:5173/login`.
3. Sign in with `user@example.com` / `password`.
4. You should land on `/home` and see **Hello Collaborateur User** (or the matching `name` from the database).
