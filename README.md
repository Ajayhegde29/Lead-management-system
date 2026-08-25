# Lead Management System

Production-oriented CRM for recording, assigning, and tracking sales leads.

This repository is a **separate frontend and backend**. The React client talks to the Express API only; MongoDB is never accessed from the browser.

## Structure

```
client/   React (Vite) SPA
server/   Express REST API
docs/     Schema and design notes (added in later phases)
```

## Local setup (Phase 1)

Requires Node.js 18+.

```bash
cd server
copy .env.example .env
npm install
npm run dev
```

```bash
cd client
copy .env.example .env
npm install
npm run dev
```

- API health check: http://localhost:5000/api/health
- Frontend: http://localhost:5173

Database, authentication, and lead APIs are added in later phases. Do not commit `.env` files.
