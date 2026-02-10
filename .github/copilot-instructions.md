# Copilot Instructions for backspaceNode

## Project Overview
- This is a TypeScript/JavaScript project with source code in `src/` and static assets in `public/`.
- Entry point: `src/index.ts` (likely main server or app logic).
- Static files (HTML, CSS, JS, images) are served from `public/`.

## Architecture & Patterns
- **Single main entry**: All backend logic is in `src/index.ts`.
- **Frontend**: `public/` contains `index.html`, `backspace.html`, CSS, and JS for client-side logic.
- **No monorepo or submodules**: Flat structure, no evident microservices.
- **TypeScript**: Project uses TypeScript (`tsconfig.json` present).

## Developer Workflows
- **Build**: Use `tsc` (TypeScript compiler). Run `npx tsc` to compile TypeScript to JavaScript.
- **Run**: If a Node.js server, use `node dist/index.js` after build (adjust if output dir differs).
- **No test framework detected**: Add tests in `src/` if needed.
- **No custom scripts in package.json**: Add scripts for build/run as needed.

## Conventions & Patterns
- **Source code**: All backend logic in `src/`, frontend in `public/`.
- **Static assets**: Place images in `public/img/`, styles in `public/*.css`.
- **No framework lock-in**: No React, Express, or other frameworks detected by structure alone.
- **No .env or config**: Add environment/config files if needed for secrets or settings.

## Integration Points
- **No external APIs or DBs detected**: Add integration details here if/when added.
- **Robots/sitemap**: `robots.txt` and `sitemap.xml` in root for SEO/crawlers.

## Examples
- To add a new route or API, edit `src/index.ts`.
- To update homepage UI, edit `public/index.html` and `public/homepage.css`.

## Key Files
- `src/index.ts`: Main backend logic
- `public/index.html`: Main frontend entry
- `tsconfig.json`: TypeScript config
- `package.json`: Dependencies and scripts

---
_If you add new conventions or workflows, update this file to help future AI agents and developers._
