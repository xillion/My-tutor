# My personal tutor

Tauri 2 + Svelte 5 + TypeScript. Stage 0 (MVP skeleton), desktop only.

## Run
- Browser (no Rust needed): `npm run packs && npm run dev` → http://localhost:1420 (progress in localStorage)
- Desktop: `npm run tauri dev` (progress in SQLite). Fedora deps:
  `sudo dnf install webkit2gtk4.1-devel libsoup3-devel librsvg2-devel openssl-devel gtk3-devel`
- Checks: `npm run check`, `npm test`

## Layout
- `schemas/` JSON Schemas for pack files (schema_version 1)
- `packs-src/<id>/` pack sources; `npm run packs` zips them into `public/packs/`
- `src/core/` UI-independent logic: packs loader, vocab+FSRS, storage port, provider stubs (TTS/LLM), capabilities
- `src/themes/` CSS-variable themes (add `<id>.css` + register in `themes.ts`)
- `src/ui/` Svelte screens
