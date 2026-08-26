# Technical design note

## Technology choices

React provides a composable responsive UI with protected routes and a centralized API layer. Node.js and Express keep the API lightweight, JSON-first, and independently usable by a future mobile app. MongoDB and Mongoose fit the document-shaped lead workflow while retaining indexing and aggregation support. JWT is a practical stateless API authentication mechanism for this assessment.

## Authentication and validation

The login controller verifies the bcrypt password hash, signs an expiring JWT containing identity and role, and returns only safe user fields. Authentication middleware validates Bearer tokens and resolves the current user. The client persists the token/user, injects it from one Axios interceptor, protects application routes, and clears expired sessions on `401`.

Lead values are centralized, normalized, and validated in the UI and API. The server remains authoritative for malformed JSON, enum values, ObjectIds, numeric values, duplicate keys, and follow-up date sequencing.

## Data, reporting, and extensibility

User-to-Lead and Lead-to-FollowUp are reference relationships. Follow-ups stay normalized for growing history. List-oriented indexes support common filters and ordering. Dashboard metrics use MongoDB aggregation rather than loading all leads into Node.js. Pagination avoids unbounded downloads.

Business options are centralized. Adding `AI Application Development` changes the shared option sets and automatically flows to model/API/UI validation. Future fields require a schema field, validator entry, API payload handling, and reusable form field rather than an architectural rewrite.

## Production evolution

The project includes loading, empty, and error states; prevents orphan follow-ups; and has automated integration tests. A production evolution would add role-based permissions, audit events, rate limits, refresh-token rotation, alerting, backups, file storage, CI/CD, and observability.
