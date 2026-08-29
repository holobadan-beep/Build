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

**Not yet built:** Git integration, debugger, extension marketplace, and native iOS (Android is done — see below; iOS needs a macOS machine + Apple Developer account to build/sign, which can't be provisioned from this environment, but the same Capacitor bridge will work for it with an `npx cap add ios` once you have that setup).

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

## Mobile (Android) — now available

Android is wired up via Capacitor, sharing the exact same React codebase as desktop. On mobile, `window.codex` (the API every component calls) is backed by native Filesystem/Share plugins instead of Electron IPC — see `src/platform/capacitorBridge.ts`.

**What works on Android:**
- Real file explorer, editor, tabs, save — backed by the app's own sandboxed storage (`Documents/CodeX/<project>/`)
- Create/Open Project (mobile doesn't get OS-wide folder access, so this replaces "Open Folder" — matches how every mobile IDE works)
- File upload (native file picker), with the same PNG/JPG/JPEG block and 100 MB limit as desktop
- ZIP extract and ZIP download — download hands off to the native Share sheet so you can save to Files, Drive, etc.

**What's intentionally not faked on Android:**
- Terminal — there's no shell a sandboxed app can spawn without root. `TerminalPanel` shows "No shell available on this platform" instead of pretending.

### Build the APK

Locally (needs Android Studio / SDK + JDK 17):
```bash
npm run android:build
# APK at android/app/build/outputs/apk/debug/app-debug.apk
```

Or just push to GitHub — the `build-android` job in `.github/workflows/build.yml` builds a debug APK on every push and uploads it as an artifact (Actions tab → the run → Artifacts → `code-x-android-debug-apk`). This is a **debug-signed APK**, fine for installing and testing directly; a production release to the Play Store needs a proper release keystore, which isn't something that can be generated here — it has to be created and kept private by you.

### Installing the APK on your phone

Download `code-x-android-debug-apk.zip` from the Actions artifact, extract it (you'll get `app-debug.apk`), then open it on your Android device (you may need to allow "install unknown apps" for your file manager/browser).

## Support

- Email: support@code.x
- Telegram: @gwrandi
- Updates: @Code-X_Offc
