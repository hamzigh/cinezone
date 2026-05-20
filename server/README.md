# CineZone Server

Express backend for the Angular UI in `../ui`.

## Setup

1. Create `server/.env` from `.env.example`.
2. Confirm PostgreSQL has a database named `cinezone`.
3. Install dependencies:

```bash
npm install
```

4. Start the API:

```bash
npm run dev
```

The server creates the required `users` and `watchlist` tables on startup.

## API Contract

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/movies?search=&genre=`
- `GET /api/movies/:id`
- `GET /api/movies/:id/stream`
- `GET /api/watchlist`
- `POST /api/watchlist`
- `DELETE /api/watchlist/:movieId`

Movie IDs are IMDb IDs where available, which lets the stream endpoint return a VidAPI/Vaplayer embed URL.
