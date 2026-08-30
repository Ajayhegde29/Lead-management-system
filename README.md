# LeadFlow — Lead Management System

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://client-topaz-six-52.vercel.app)
[![API](https://img.shields.io/badge/API-Render-46E3B7?logo=render&logoColor=white)](https://lead-management-system-1cyt.onrender.com/api/health)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)

A full-stack CRM-style web application for managing incoming sales opportunities from first contact to follow-up. LeadFlow gives a small sales team one place to capture leads, prioritize pipeline value, record conversations, and keep next actions visible.

**Live application:** [Open LeadFlow](https://client-topaz-six-52.vercel.app) · **API health check:** [Open API status](https://lead-management-system-1cyt.onrender.com/api/health)

> The hosted API is on Render's free tier and may take a short time to wake after inactivity.

## Why I built it

Sales leads are often tracked across spreadsheets, messages, and notes. This project turns that workflow into a focused web application with secure access, structured data, duplicate prevention, a searchable pipeline, and a chronological follow-up history.

## Highlights

- Secure JWT-based sign-in with protected client routes and API endpoints
- Create, view, edit, and delete lead records
- Search by name, company, email, or phone; filter and sort the lead pipeline
- Prevent duplicate leads by normalized email and mobile number
- Record follow-ups and upcoming next-follow-up dates
- Dashboard metrics backed by MongoDB aggregation queries
- Responsive UI with clear loading, empty, validation, and error states
- Deployed frontend, API, and managed database using Vercel, Render, and MongoDB Atlas

## Screens and workflow

```text
Sign in → Dashboard → Lead pipeline → Lead profile → Follow-up history
                           ↓
                    Create / edit lead
```

The lead profile pairs complete contact and opportunity data with a quick pipeline snapshot. The editor includes field-level validation, while the server independently validates every request before it reaches MongoDB.

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React 18, React Router, Axios, Vite, Tailwind CSS |
| Backend | Node.js, Express, Mongoose |
| Authentication | JSON Web Tokens, bcryptjs |
| Database | MongoDB / MongoDB Atlas |
| Security | Helmet, CORS, request validation, protected routes |
| Testing | Jest, Supertest |
| Deployment | Vercel (client), Render (API), MongoDB Atlas (database) |

## Architecture

```text
┌─────────────────┐       HTTPS / JSON       ┌──────────────────┐
│ React + Vite SPA│ ───────────────────────► │ Express REST API │
│     (Vercel)    │ ◄─────────────────────── │     (Render)     │
└─────────────────┘      JWT Bearer token    └────────┬─────────┘
                                                        │ Mongoose
                                                        ▼
                                               ┌─────────────────┐
                                               │ MongoDB Atlas   │
                                               └─────────────────┘
```

The browser talks only to the API; MongoDB credentials and business rules stay on the server. The API handles authentication, validation, duplicate checks, filtering, pagination, and dashboard calculations.

## Key engineering decisions

- **Server-authoritative validation:** client validation improves user feedback, but the API validates formats, enums, IDs, values, and dates independently.
- **Duplicate protection:** normalized email and mobile fields have unique MongoDB indexes; conflicts return `409 Conflict`.
- **Scalable listing:** search, filters, sorting, and pagination are handled in MongoDB rather than loading every lead into the browser.
- **Normalized follow-ups:** follow-ups are stored separately from leads so a growing history remains easy to query and maintain.
- **SPA refresh support:** `client/vercel.json` rewrites routes to `index.html`, so protected URLs continue to work after a browser refresh.

## Repository structure

```text
client/                 React single-page application
  src/components/       Reusable UI and forms
  src/context/          Authentication state
  src/layouts/          Protected application shell
  src/pages/            Login, dashboard, leads, profile, editor
  src/routes/           Public and protected routes
  src/services/         Centralized Axios API calls
server/                 Express REST API
  config/               Environment loading and database connection
  controllers/          Request handlers
  middleware/           JWT authentication and error handling
  models/               User, Lead, FollowUp schemas
  routes/               API route definitions
  tests/                Jest/Supertest integration tests
  validators/           Request validation
docs/                   Database schema, design, and deployment notes
```

## Run locally

### Prerequisites

- Node.js 18 or later
- A local MongoDB instance or MongoDB Atlas connection string

### 1. Start the API

```powershell
cd server
Copy-Item .env.example .env
npm install
```

Set the required values in `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/lead-management
JWT_SECRET=replace-with-a-long-random-value
JWT_EXPIRES_IN=8h
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Generate a secure local JWT secret if required:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Create a local development admin and run the server:

```powershell
npm run seed:admin
npm run dev
```

The API health endpoint is available at `http://localhost:5000/api/health`.

### 2. Start the client

```powershell
cd ../client
Copy-Item .env.example .env
npm install
npm run dev
```

For local development, set `VITE_API_URL=http://localhost:5000/api` in `client/.env` if it is not already configured. Open the Vite address shown in the terminal, normally `http://localhost:5173`.

## API overview

Successful responses use `{ success, data }`; errors use `{ success: false, message, errors? }`. Protected endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/login` | Authenticate and receive a JWT |
| GET | `/api/health` | Service health check |
| GET / POST | `/api/leads` | List/search leads or create a lead |
| GET / PUT / DELETE | `/api/leads/:id` | Read, update, or remove a lead |
| GET / POST | `/api/leads/:id/follow-ups` | Read history or add a follow-up |
| GET | `/api/dashboard/stats` | Pipeline counts and value metrics |

`GET /api/leads` supports `search`, `status`, `service`, `source`, `assignedTo`, `sortBy`, `sortOrder`, `page`, and `limit` query parameters.

## Quality checks

```powershell
# API tests and linting
cd server
npm run lint
npm test

# Client linting and production build
cd ../client
npm run lint
npm run build
```

Tests use a separate test database and clean only the application's collections. They do not use the main development database.

## Deployment

| Service | Platform | Configuration |
| --- | --- | --- |
| Client | Vercel | `VITE_API_URL=https://<api-domain>/api` |
| API | Render | `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `NODE_ENV=production` |
| Database | MongoDB Atlas | Allow Render network access and create an application database user |

The client’s `vercel.json` handles React Router refreshes. The server’s `CLIENT_URL` must exactly match the deployed Vercel frontend origin so CORS accepts browser requests.

See the detailed [deployment guide](docs/deployment.md), [technical design note](docs/technical-design.md), and [database schema](docs/database-schema.md).

## Security notes

- Never commit `.env` files, passwords, JWT secrets, or Atlas connection strings.
- Passwords are hashed with bcrypt before storage.
- JWT secrets are provided only through environment variables.
- Remove one-time production bootstrap credentials from the hosting environment after the admin account is created.

## Future improvements

- Role-based permissions and user management
- Reminder notifications for upcoming follow-ups
- Audit log for record changes
- File attachments and conversation notes
- Rate limiting, refresh-token rotation, monitoring, and CI/CD

---

Built as a portfolio project to demonstrate full-stack development, API design, database modeling, deployment, and thoughtful user experience.
