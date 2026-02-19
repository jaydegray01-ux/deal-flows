# Deal Flow (Replit → Production Deploy)

This repo is already structured as a single deployable full‑stack app:

- **Client:** React + Vite (builds into `dist/public`)
- **Server:** Express (bundled to `dist/index.cjs`)
- **DB:** Postgres (Drizzle ORM)

The server serves the built client in production, so you deploy **one** web service.

---

## 1) Run locally

### Prereqs
- Node 20+
- Postgres running locally (or use a hosted Postgres)

### Setup
```bash
npm install
cp .env.example .env
# set DATABASE_URL in .env
```

### Create/update DB tables
```bash
npm run db:push
```

### Start dev server (API + Vite)
```bash
npm run dev
```

Open:
- http://localhost:5000

---

## 2) Deploy (recommended): Render (free/cheap)

### Fast path (Blueprint)
1. Push this code to a **GitHub repo**
2. In Render: **New → Blueprint**
3. Select your repo
4. Render will read `render.yaml` and create:
   - `deal-flow` web service
   - `deal-flow-db` Postgres database
5. It will auto-set:
   - `DATABASE_URL` (from the database)
   - `SESSION_SECRET` (generated)

### After first deploy: run migrations
In the Render web service:
- Open **Shell**
- Run:
```bash
npm run db:push
```

---

## 3) Production notes

### Environment variables (Render)
- `DATABASE_URL` (required)
- `SESSION_SECRET` (required)

The app now **fails fast** in production if either is missing.

### Health check
- `/api/health`

---

## 4) Typical “improve it” checklist (next)
If you want, I can implement these in code too:
- Admin bootstrap command (create first admin user)
- Rate limiting on auth endpoints
- Better error logging + request IDs
- Background job queue for scraping
- Tests for scraper + API routes
