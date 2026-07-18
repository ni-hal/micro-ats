# Micro-ATS — Smart Interview Scheduler

A full-stack interview scheduling application for recruitment teams. It lets recruiters manage candidates and interviewers, schedule interviews, and prevents interviewer double bookings.

## Features

- Login and self-registration with JWT authentication
- Candidate management with editable hiring stages
- Interviewer management, including department, designation, and display timezone
- Weekly interview calendar rendered in the viewer's browser timezone
- Conflict-safe scheduling: overlapping interviews for the same interviewer are rejected
- UTC-only interview storage in MongoDB
- Per-admin data isolation: one account cannot access another account's candidates, interviewers, or bookings

## Tech stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JWT and bcrypt password hashing

## Run locally

### 1. Start MongoDB

Run MongoDB locally, or set `MONGO_URI` to a MongoDB Atlas connection string.

### 2. Configure the backend

```powershell
cd backend
Copy-Item .env.example .env
```

Set the required values in `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/micro_ats
JWT_SECRET=use-a-long-random-secret
JWT_EXPIRES_IN=8h
```

Then install and run the API:

```powershell
npm install
npm run dev
```

The API starts at `http://localhost:5000`.

### 3. Start the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the backend.

## Core API

All endpoints other than authentication and health require:

```http
Authorization: Bearer <token>
```

Every candidate, interviewer, and interview slot is owned by the authenticated account. API queries enforce this ownership, including direct requests made with another record's ID.

> Existing records created before this ownership feature do not have an owner and will not appear in any account. Assign an `owner` ObjectId to those records, or recreate them after signing in.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account and return a JWT |
| POST | `/api/auth/login` | Sign in and return a JWT |
| GET | `/api/candidates` | List candidates |
| POST | `/api/candidates` | Create a candidate |
| PATCH | `/api/candidates/:id/status` | Update candidate status |
| GET | `/api/interviewers` | List interviewers |
| POST | `/api/interviewers` | Create an interviewer |
| GET | `/api/interviewers/:id/schedule` | Get one interviewer's scheduled interviews |
| GET | `/api/schedule` | Get all scheduled interviews |
| POST | `/api/schedule` | Create an interview booking |
| PATCH | `/api/schedule/:slotId/cancel` | Cancel a booking |

## Scheduling contract

Create a booking with UTC ISO-8601 timestamps:

```json
{
  "candidateId": "candidate-id",
  "interviewerId": "interviewer-id",
  "startTime": "2026-07-20T09:30:00.000Z",
  "endTime": "2026-07-20T10:15:00.000Z"
}
```

The backend rejects overlaps using:

```text
existing.startTime < newEnd AND existing.endTime > newStart
```

On conflict, it returns HTTP `409` with the conflicting candidate so the UI can ask the recruiter to choose another time.

MongoDB stores each interview time as a UTC `Date`. The frontend converts it for display with the browser's local timezone, so recruiters in different locations see the correct local time for the same interview.
