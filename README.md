# Bhaukaal FM YouTube setup

1. Import this folder into Vercel as a new project. Framework preset: **Other**. Build command: none. Output directory: `.`.
2. In **Settings → Environment Variables**, add `YOUTUBE_API_KEY` with your YouTube Data API v3 key. Do not place that key in client-side files.
3. Deploy. The `/api/fresh-hits` Vercel Function combines the fixed featured playlist `PLwyqDgjhF4Qpq6kslMcQ8NR6RHb-Z4Tu-` with a weekly list of embeddable Bhojpuri music, excludes devotional/religious terms, and removes duplicate videos before the browser receives it.
4. For real-time live visitors, install the **Upstash Redis** integration from the Vercel Marketplace. It injects `KV_REST_API_URL` and `KV_REST_API_TOKEN`; the `/api/presence` endpoint uses them to maintain an expiring visitor heartbeat.
5. For local UI work, start the included local server with `node server.js`, then open `http://localhost:4173`. Fresh API results and live presence require a Vercel deployment (or local equivalents).

The player uses YouTube's IFrame Player API for real playback. The fallback selection is available until the Vercel API is configured.
