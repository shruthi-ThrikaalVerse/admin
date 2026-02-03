<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/188AiFTpM6Zsr_dG-CZ90srEiivY4YmdM

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Tailwind & Project Structure ✅

- Project has been reorganized to a standard React + TypeScript structure under `src/`.
- Tailwind CSS has been added with `tailwind.config.cjs` and `postcss.config.cjs`. Install new dev dependencies:

```bash
npm install -D tailwindcss postcss autoprefixer
```

- Entry point: `src/main.tsx`. Global styles: `src/styles/index.css` (includes Tailwind directives).
- After installing deps, run `npm run dev` for local development. If you prefer to build Tailwind output manually, you can run a Tailwind CLI command or rely on Vite/PostCSS during dev/build.


## Audit Server (dev mode)

A small demo audit server is included at `server/index.js` for local development. It exposes:

- `GET /api/admin/audit-logs` — queryable, paginated logs (requires Authorization bearer token).
- `POST /api/admin/export-logs` — accept filter and return CSV/JSON export (requires CSRF header `x-csrf-token: demo-csrf-token`).
- `POST /api/admin/audit-access` — logs access to the audit viewer (used by the UI).

Run it alongside the frontend: `npm run server`.

Demo tokens available for development:

- `admin-token` — role `admin` (use in header `Authorization: Bearer admin-token`)
- `auditor-token` — role `auditor` (use `Authorization: Bearer auditor-token`)

Note: This demo server is for development only and uses an in-memory store; for production wire it to your central log storage, enable persistent sessions, and strengthen CSRF/authentication mechanisms.
