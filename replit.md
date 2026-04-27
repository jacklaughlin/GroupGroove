# GroupGroove

A family music sharing app for groups of 3–8 people who are separated by distance. Each member shares a song of the day with their group, and other members rate each song on a 1–10 scale.

## Architecture

- **Frontend**: React + Vite (port 5000) — `client/`
- **Backend**: Express.js API (port 3001) — `server/`
- **Database**: PostgreSQL (Replit built-in)

## Running the App

Single workflow runs both services:
```bash
bash run.sh
```
This starts the backend (`node server/index.js`) and frontend (`cd client && npm run dev`) together.

## Key Features

- User registration and login (JWT authentication)
- Create groups with auto-generated invite codes
- Join groups via invite code (max 8 members)
- Submit one song per day per group (title, artist, optional Spotify/YouTube link, note)
- Rate other members' songs on a 1–10 scale
- View average ratings per song

## Project Structure

```
├── server/
│   ├── index.js          # Express app entry point
│   ├── db.js             # PostgreSQL connection pool
│   ├── schema.sql        # Database schema
│   ├── middleware/
│   │   └── auth.js       # JWT authentication middleware
│   └── routes/
│       ├── auth.js       # Register/login endpoints
│       ├── groups.js     # Group create/join/list endpoints
│       └── songs.js      # Song submit/list/rate endpoints
├── client/
│   ├── src/
│   │   ├── App.jsx       # Router and layout
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth state and API helpers
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── Home.jsx  # Group list, create/join
│   │       └── Group.jsx # Song feed and ratings
│   └── vite.config.js    # Proxies /api to localhost:3001
├── run.sh                # Starts both services
└── package.json          # Backend dependencies
```

## Theme

White and red (`#e63946`) — clean and simple.

## Environment Variables

Set automatically by Replit database provisioning:
- `DATABASE_URL`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
