# Lead Management System

A production-oriented CRM for recording, assigning, following up, and reporting on sales leads. It is deliberately split into a React single-page application and an independently consumable Express REST API.

## Features

- JWT login and protected client/server routes
- Bcrypt-hashed admin account seed
- Lead CRUD with duplicate protection, search, combined filters, sorting, and pagination
- Follow-up history and next-follow-up tracking
- MongoDB-backed dashboard statistics and status breakdown
- Responsive forms, tables, loading states, empty states, and error handling
- Automated API tests using an isolated local test database

## Stack and architecture

- Frontend: React 18, React Router, Axios, Vite, Tailwind CSS
- Backend: Node.js, Express, Mongoose, JWT, bcryptjs, Helmet, CORS
- Database: MongoDB

```text
React SPA  -- HTTPS/JSON -->  Express REST API  -->  MongoDB
```

The browser never accesses MongoDB. Authentication, business validation, duplicate protection, querying, and aggregation all run in the API.

## Repository structure

```text
client/                 React application
  src/components/       Reusable UI
  src/context/          Authentication state
  src/layouts/          Protected application shell
  src/pages/            Login, dashboard, leads, details, editor
  src/routes/           Public/protected routes
  src/services/         Centralized Axios API calls
server/                 Express application
  config/               Environment and database connection
  constants/            Centralized business option values
  controllers/          Request handling
  middleware/           JWT authentication
  models/               User, Lead, FollowUp schemas
  routes/               REST endpoints
  scripts/              Admin seed command
  tests/                Jest/Supertest integration tests
  validators/           Lead request validation
docs/                   Schema and technical design notes
```

## Local setup

Prerequisites: Node.js 18+ and a running MongoDB instance.

### Backend

```powershell
cd server
Copy-Item .env.example .env
npm install
```

Edit `server/.env`. At minimum, set a local/Atlas MongoDB connection string and a unique JWT secret:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/lead-management
JWT_SECRET=replace-this-with-a-long-random-value
```

Generate a secret locally if needed:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Create the development admin (safe to rerun; it does not overwrite an existing password):

```powershell
npm run seed:admin
npm run dev
```

For a first production deployment without shell access, set `BOOTSTRAP_ADMIN_USERNAME` and `BOOTSTRAP_ADMIN_PASSWORD` in the host environment. The server creates that admin only if it does not already exist; remove both variables after it has been created.

API health check: `http://localhost:5000/api/health`.

### Frontend

```powershell
cd client
Copy-Item .env.example .env
npm install
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`.

### Test credentials

```text
Username: admin
Password: Admin@123
```

The seed script is the only intentional use of this development password; Mongoose hashes it before database persistence.

## API reference

Responses use `{ success, data }` for success and `{ success: false, message, errors? }` for errors. Send protected requests with `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/login` | Authenticate and receive a JWT |
| GET | `/api/health` | API health check |
| GET | `/api/leads` | List/search/filter/sort/paginate leads |
| POST | `/api/leads` | Create a lead |
| GET | `/api/leads/:id` | Get lead details |
| PUT | `/api/leads/:id` | Update a lead |
| DELETE | `/api/leads/:id` | Delete a lead and its follow-ups |
| GET | `/api/leads/:id/follow-ups` | Get lead follow-up history |
| POST | `/api/leads/:id/follow-ups` | Add a follow-up |
| GET | `/api/dashboard/stats` | Get aggregate dashboard statistics |

### Lead query parameters

`GET /api/leads` accepts `search` (name, company, email, or mobile), `status`, `service`, `source`, `assignedTo`, `sortBy` (`createdAt`/`estimatedValue`), `sortOrder` (`asc`/`desc`), `page`, and `limit` (maximum 100).

## Validation, duplicate strategy, and security

- Required lead fields: name, company, mobile, email, service, source, assignee, status
- Server validation independently checks email, phone format, non-negative estimated value, enums, ObjectIds, and follow-up dates.
- Lead email is normalized to lowercase. Both `email` and `mobile` have unique indexes, so either duplicate yields `409 Conflict`.
- Frontend validation improves feedback only; the API remains authoritative.
- Passwords are hashed with bcryptjs. JWT secrets come from environment variables and are never shipped to the client.
- Helmet, CORS, request-size limits, safe allowlisted sorting, escaped search regexes, and consistent errors provide baseline protection.

Potential business value sums active pipeline statuses: New, Contacted, Proposal Sent, and Negotiation. Won and Lost are excluded.

## Testing and quality checks

```powershell
cd server
npm run lint
npm test
```

Tests use the dedicated `lead-management-system-jest-test` database and clean only the application collections in it. They do not use the main development database.

```powershell
cd client
npm run lint
npm run build
```

## Deployment

- Deploy `client` to Vercel and set `VITE_API_URL` to the public API URL ending in `/api`.
- `client/vercel.json` rewrites SPA routes to `index.html`, so direct links and browser refreshes work on protected React routes.
- Deploy `server` to Render/Railway and configure `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `PORT`, and `NODE_ENV=production`.
- Use MongoDB Atlas for production, allow the backend host’s network access, and set `CLIENT_URL` to the deployed frontend origin.
- Do not commit `.env`, `node_modules`, build artifacts, or production secrets.

The step-by-step release guide is in [deployment.md](docs/deployment.md). A Render Blueprint is included in [render.yaml](render.yaml).

## Assumptions and future improvements

- This assessment currently has one seeded admin, so the UI assigns leads to that account. A user-management endpoint can later provide a full assignee selector.
- Services, sources, statuses, and follow-up types are centralized in `server/constants/leadOptions.js` and mirrored client-side. Adding `AI Application Development` is localized.
- Possible next production additions: role-based authorization, refresh-token rotation, audit events, rate limiting, notifications, attachments, CI/CD, and monitoring.

See [database schema](docs/database-schema.md) and [technical design note](docs/technical-design.md) for design details.
