# Bump project to Node 22 for Vercel deployments

## Why
Vercel no longer allows new deployments on Node 20 and asks for a newer Node version. The project currently has no Node version pinned, so Vercel falls back to Node 20 and fails. The project already builds and runs on Node 22 (the sandbox dev environment uses Node 22.22), so moving to Node 22 is a safe, configuration-only change.

## Changes
1. **`package.json`** — add an `engines` field pinning Node 22:
   ```json
   "engines": { "node": "22.x" }
   ```
   This tells Vercel (and any host) to use Node 22 for installs and builds.
2. **`.nvmrc`** (new file) — a single line `22`, so local environments and Vercel both pick up Node 22 automatically.

No dependency, source, or backend changes are needed.

## Functional impact
None. Node version only affects the build toolchain (`vite build`) — the app's output is identical JavaScript that runs in the browser. Vite 5, React 18, TypeScript 5, and all current dependencies fully support Node 22, and the project has been building on Node 22 in this workspace already.

## Verification
- Confirm `package.json` and `.nvmrc` contain the new version pins.
- Let the automatic build run and check the build log is clean.
