# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start        # dev server (Vite)
npm run build        # production build → dist/
npm run test         # run Vitest in watch mode
npm run sync-tokens  # sync SCSS $variables → CSS custom properties in index.scss
```

Run a single test file:
```bash
npx vitest src/Helpers/Helpers.test.ts
```

## Architecture

**Stack:** React 19 + TypeScript, Vite, Redux Toolkit, Supabase (auth + database), MUI v9, SCSS modules, Recharts. Deployed on Netlify.

### Auth — dual-layer pattern

There are two auth mechanisms that co-exist:

1. **`AuthContext`** (`src/context/AuthContext.tsx`) — the live source of truth for the UI. Holds `authUser` (Supabase auth object), `userProfile` (row from the `users` table), `isAdmin`, and session methods (`signIn`, `signUp`, `signOut`). Components should consume this via `useAuth()`.

2. **`authSlice`** (`src/store/slices/authSlice.tsx`) — a Redux slice with its own thunks. Appears to be a legacy or parallel implementation. The main routing and `ProtectedRoute` rely on `AuthContext`, not this slice.

`ProtectedRoute` (`src/components/shared/ProtectedRoute/ProtectedRoute.tsx`) accepts `requiredRole: "admin" | "client"` and redirects accordingly. Admins are always redirected away from client routes and vice versa.

**Sign-up requires an access token.** The flow validates against the `platform_access_token` Supabase table and calls the `consume_platform_access_token` RPC to mark tokens as used.

### Redux store

Slices: `userDirectory`, `questionnaires`, `assignments`, `responses`, `resources`, `theme`.

The `inspirationalQuotesApi` uses RTK Query (hitting `https://api.quotable.io`). Its reducer and middleware are registered in the store.

Use typed hooks from `src/store/hooks.ts`:
- `useAppDispatch()` instead of `useDispatch`
- `useAppSelector()` instead of `useSelector`

### Routing

Two role-based route trees under `App.tsx`:
- **Client routes:** `/dashboard`, `/check-in`, `/resources`
- **Admin routes:** `/admin`, `/admin/clients`, `/admin/questionnaires`, `/admin/resources`

`/` redirects based on auth state. The `AppLayout` wrapper adds the shared `Navbar`.

### Styling system

SCSS design tokens live in `src/styles/`: `_colors.scss`, `_spacing.scss`, `_typography.scss`, `_mixins.scss`.

Tokens are exposed as CSS custom properties (`--accent`, `--text-primary`, etc.) in `src/index.scss`. Dark mode is toggled by adding the `.dark` class to `<html>` — managed by `themeSlice` + `ThemeWrapper` in `App.tsx`.

**`sync-tokens.js`** reads leaf `$variable` values from the SCSS files and writes them into the `:root` and `.dark` blocks of `index.scss`. Run after editing token files.

Components use SCSS modules (e.g. `Card.module.scss`) and reference CSS custom properties rather than SCSS variables at the component level.

### Supabase

Client singleton at `src/lib/supabase.js`. Requires `.env` with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Key tables mirrored in `src/models/globalTypes.tsx`: `users`, `questionnaires`, `questions`, `questionnaire_assignments`, `responses`, `resources`, `platform_access_token`.

`UserRole` enum uses `"admin"` / `"client"` — note `globalTypes.tsx` defines both a string union `Role` (`"admin" | "user"`) and an enum `UserRole` (`"admin" | "client"`). The live codebase uses `"client"` (not `"user"`) for the client role.
