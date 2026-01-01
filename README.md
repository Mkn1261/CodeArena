# CodeArena

**CodeArena** is an AI-powered talent evaluation and coding platform for recruiters and developers. It streamlines assessment, real-time chat, and application tracking—all in a modern, full-stack web application.

## Features

- **User Authentication:** Sign up and login via Clerk (supports OAuth).
- **AI-Powered Coding Assessments:** Automate skill screening and code evaluations for candidates.
- **Real-Time Messaging:** Built-in chat via Stream Chat API for candidate-recruiter and peer communications.
- **Application Tracking:** Keep tabs on job applications, interviews, and status updates.
- **Role-Based Dashboards:** Distinct views for recruiters and developers.
- **Cloud Database:** All user, job, and messaging data securely stored in MongoDB Atlas.
- **Task Automation:** Leverage Inngest for background job scheduling (notifications, emails).

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas
- **Authentication:** Clerk
- **Messaging:** Stream Chat API
- **Background Jobs:** Inngest

## Getting Started

### Prerequisites

- Node.js & npm
- MongoDB Atlas (cloud, free tier)
- Clerk & Stream accounts (free tier)
- Inngest (for scheduling jobs)

### Setup

#### 1. Clone the repo

```bash
git clone https://github.com/Mkn1261/CodeArena.git
cd codearena
2. Setup Backend
cd backend
npm install
# Create and fill .env with your credentials
npm run dev
3. Setup Frontend
cd frontend
npm install
# Create and fill .env.local with your credentials
npm run dev
4. Environment Variables
Backend (.env)
PORT=3000
NODE_ENV=development
DB_URL=<your_mongo_uri>
INNGEST_EVENT_KEY=<your_inngest_event_key>
INNGEST_SIGNING_KEY=<your_inngest_signing_key>
STREAM_API_KEY=<your_stream_api_key>
STREAM_API_SECRET=<your_stream_api_secret>
CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
CLERK_SECRET_KEY=<your_clerk_secret_key>
CLIENT_URL=http://localhost:5173
Frontend (.env.local)
VITE_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
VITE_API_URL=http://localhost:3000/api
VITE_STREAM_API_KEY=<your_stream_api_key>
5. Running the App
Start backend and frontend servers (each in their own terminal)
Access the app at http://localhost:5173
Contributing

Open to pull requests! Please fork and submit a PR.