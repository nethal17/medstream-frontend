# MedStream Frontend Guidelines

## Project Shape
- Stack: React 19 + Vite 7 + React Router + Axios + Tailwind CSS v4 utilities.
- Entry point: `src/main.jsx` mounts `App` inside `BrowserRouter` and configures `react-hot-toast`.
- Current app shell: `src/App.jsx` is the route/root UI composition point.
- HTTP layer: `src/services/api.js` exports the shared Axios client with bearer token handling and automatic refresh.

## Directory Map
- `src/components/ui/`: reusable UI primitives.
- `src/components/`: feature or shared composed components.
- `src/pages/`: route-level pages (create this when adding routed screens).
- `src/services/`: API modules that call backend endpoints through `api` from `src/services/api.js`.
- `src/lib/`: pure utilities, formatting helpers, and small shared functions.
- `src/assets/`: static assets.

## Best Practices
- Keep pages thin: move API calls into `src/services/*` and reusable view logic into hooks or `src/lib/*` helpers.
- Reuse existing UI primitives from `src/components/ui/*` before introducing new component variants.
- Use the shared Axios client (`src/services/api.js`) instead of creating per-feature clients, so auth/refresh remains centralized.
- Keep route state URL-driven where practical (query params for filters and selections).
- Handle request states explicitly in UI: loading, empty, success, and error.
- Prefer small focused modules and avoid large multi-purpose files.

## Editing Rules For Agents
- Preserve existing naming style and file organization.
- Avoid broad refactors unless requested.
- Do not break public component props or existing service function contracts without updating call sites.
- Run `npm run lint` after meaningful code changes.

## Dev Commands
- Install: `npm i`
- Start dev server: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`