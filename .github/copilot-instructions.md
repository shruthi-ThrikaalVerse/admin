# Copilot / AI Agent Instructions for this repository ✅

Purpose
- Help any AI-based coding assistant get productive quickly by pointing to architecture, conventions, workflows, and gotchas observed in the codebase.

Quick dev commands
- Install deps: `npm install`
- Start frontend dev server: `npm run dev` (Vite default port 3000)
- Start demo audit backend (dev only): `npm run server` (runs `server/index.js`, default port 4201)
- Build for production: `npm run build`
- Preview build: `npm run preview`

Key environment variables
- `GEMINI_API_KEY` — set in `.env.local` (used via Vite define). See `vite.config.ts`.
- `USE_MOCK_AUDIT=1` — set to disable /api proxy and force local mock audit data (useful for offline development).
- `AUDIT_HOST` / `AUDIT_PORT` — used by Vite to test whether to proxy `/api` to the demo audit server (see `vite.config.ts`).

Big-picture architecture
- Frontend: React + TypeScript app under `src/`.
  - Entry: `src/main.tsx` → `src/App.tsx` (routes)
  - Routing: uses HashRouter and role-based guards (`ProtectedRoute`, `AdminRoute`, `PublicRoute`) in `src/components/RouteGuards.tsx`.
  - Global app state: two React context providers:
    - `AuthProvider` (`src/context/AuthContext.tsx`) — localStorage-based session emulation; default admin credential (email: `admin@hrms.com`, password: `admin123`) for dev.
    - `HRMSProvider` (`src/context/HRMSContext.tsx`) — single source-of-truth for mocked HRMS data persisted to localStorage (`STORAGE_KEY = 'HRMS_PRO_DATA_V2'`).
- Backend (dev demo): a small Express app at `server/index.js` that serves demo audit endpoints and uses an in-memory store for tokens and logs.

Important data & patterns to follow
- Local mock data: `src/mockData.ts` provides realistic data used by the UI. Many features expect and fall back to these mocks.
- localStorage keys:
  - Auth session: `HRMS_AUTH_SESSION_V1` (see `AuthContext.tsx`)
  - HRMS data: `HRMS_PRO_DATA_V2` (see `HRMSContext.tsx`)
- API wrapper pattern: API modules (e.g., `src/api/audit.ts`):
  - Tolerant of multiple backend response shapes (`logs`, `data.logs`, `items`, `results`) and gracefully fallback to mock data.
  - When adding new endpoints, follow the same defensive parsing + mock fallback approach.
- Audit integration:
  - Frontend expects `/api/*` endpoints; Vite proxy forwards `/api` to the demo audit server if reachable (see `vite.config.ts`). When the proxy is disabled (server not reachable or `USE_MOCK_AUDIT=1`), frontend uses mock data.
  - Demo server endpoints in `server/index.js` are: `/api/admin/audit-logs`, `/api/admin/export-logs`, `/api/admin/audit-access`. Be aware these routes differ from `src/api/audit.ts`'s `/api/audit*` paths — the frontend handles mismatch via fallback logic and Vite proxy behavior.

Conventions & coding patterns
- Types: Centralized types live in `src/types.ts`. Use them liberally for new code.
- Contexts are the canonical way to share app state (Auth, HRMS). Prefer adding methods to `HRMSContext` instead of scattering state elsewhere.
- Styling: Tailwind is used (see `tailwind.config.cjs` and `src/styles/index.css`). Follow the utility-first approach used in existing components.
- Avatars and seeded images: Dicebear usage is common (`https://api.dicebear.com/...`), copy pattern when generating avatars.
- Notifications: Use `HRMSContext.notify` for in-app toasts (keeps behavior consistent with dismiss timing and duplicate-safety).

Dev & debugging tips
- If `npm run dev` warns the audit server is not reachable, run `npm run server` to start it or set `USE_MOCK_AUDIT=1` to force mocks.
- The audit export expects a CSRF header (`x-csrf-token: demo-csrf-token`) when calling the demo server export endpoint. The frontend export feature will fall back to a generated blob if the server is unavailable.
- To inspect persisted data, open Browser DevTools → Application → Local Storage; check the keys listed above.

Files to inspect when working on features
- App & routes: `src/App.tsx`
- Contexts: `src/context/AuthContext.tsx`, `src/context/HRMSContext.tsx`
- Mock data and types: `src/mockData.ts`, `src/types.ts`
- Audit: `src/api/audit.ts`, `src/pages/AuditLogs.tsx`, `server/index.js`
- UI components for patterns: `src/components/LayoutWrapper.tsx`, `src/components/Sidebar.tsx`, `src/components/RouteGuards.tsx`
- Build/dev config: `vite.config.ts`, `package.json` scripts

What not to assume
- The demo server is optional — tests and features should not rely on it being present for local dev.
- API shapes vary across backends; follow the existing defensive parsing and mock fallback approach rather than hard-coding a single shape.

When adding tests or changing persistence
- There are no project tests; add unit tests for new complex logic and component tests for critical flows. When persisting new data, follow the existing pattern of saving to the `HRMS_PRO_DATA_V2` localStorage key so local dev persists across reloads.

If you need more context
- Ask for specific flows (e.g., "How does payroll run work?") and point to a file to change; I can create a focused summary or make a small PR.

---
Was anything unclear or missing in the instructions above? Reply with a short list of areas you'd like expanded (e.g., example PR, where to add tests, or deeper flow diagrams).