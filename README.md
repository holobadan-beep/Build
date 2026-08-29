# Code X

Modern, multi-platform code editor. Desktop build on Electron + React + TypeScript + Vite + Monaco Editor + xterm.js (real terminal via `node-pty`). Mobile shell architecture ready for Capacitor.

## Status

This is a **working core**, not a mockup:

- Real filesystem access (Explorer reads actual folders/files on disk)
- Real terminal (spawns your OS shell: bash/zsh/PowerShell/cmd via `node-pty`)
- Real Monaco editor with tabs, save, syntax highlighting
- Real ZIP upload/extract (path-traversal guarded) and project download
- i18n (English + Indonesian shipped; more languages drop in as JSON files)
- 4 built-in themes, settings persistence, splash screen, command palette

**Not yet built:** Git integration, debugger, extension marketplace, and native iOS/Android apps (the mobile *web* layout exists and is responsive; wrapping it as a true native app via Capacitor is the next step — see below).

## Requirements

- Node.js 20+
- On Linux, `node-pty` needs build tools: `sudo apt-get install build-essential python3`

## Development

```bash
npm install
npm run electron:dev
```

This builds the renderer + main process once, then launches Electron pointed at the Vite dev server (`npm run dev` also works standalone if you just want to preview the UI in a browser tab, though filesystem/terminal features require Electron).

## Production build

```bash
npm run electron:build          # current OS
npm run electron:build:win      # Windows .exe (NSIS)
npm run electron:build:mac      # macOS .dmg
npm run electron:build:linux    # Linux .AppImage / .deb
```

Output goes to `release/`.

## CI/CD (GitHub Actions)

`.github/workflows/build.yml` runs on every push to `main` and on version tags (`v1.0.0` etc). It builds Windows, macOS, and Linux installers in parallel and uploads them as workflow artifacts. Pushing a tag like `v1.0.0` also creates a GitHub Release with all installers attached.

To use it: just push this repo to GitHub — no extra setup needed. The workflow uses `npm ci`, so make sure `package-lock.json` is committed.

## Security notes

- `contextIsolation: true`, `nodeIntegration: false` — the renderer never gets direct Node.js access
- All filesystem/terminal/zip operations go through a whitelisted IPC bridge (`electron/preload.ts`)
- ZIP extraction and file uploads are validated against path traversal (`assertInsideRoot`)
- Uploads: PNG/JPG/JPEG are rejected by design (see spec); max file size 100 MB

## Adding a language

Drop a new `src/i18n/xx.json` with the same keys as `en.json`, then register it in `src/i18n/index.tsx`'s `LANGUAGES` map. No other source changes needed.

## Mobile (next step)

The React UI already has a dedicated mobile layout (`src/components/MobileShell.tsx`) with bottom navigation and a stacked editor/terminal view — it is not the desktop UI shrunk down. To ship this as a real Android/iOS app, the recommended path is **Capacitor**: it wraps this same React codebase with native filesystem/share-sheet plugins so upload, ZIP download, and file management work through real OS APIs. That wiring (Capacitor config, Android/iOS projects, native plugin calls replacing the Electron IPC bridge) is a separate follow-up since it needs a macOS machine + Apple Developer account for iOS, and a Google Play developer account for Android release builds — neither of which can be provisioned from this environment.

## Support

- Email: support@code.x
- Telegram: @gwrandi
- Updates: @Code-X_Offc
