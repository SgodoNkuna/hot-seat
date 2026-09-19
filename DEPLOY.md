# Deploying Hot Seat

Two pieces, deployed separately: the WebSocket game server, and the app itself.

## 1. Game server (required for online play)

Free host: [Render](https://render.com) (or Fly.io — same idea, different UI).

1. Push this repo to GitHub.
2. On Render: New → Blueprint → point at the repo. It reads `server/render.yaml` automatically.
3. Deploy. Render gives you a URL like `hot-seat-server.onrender.com`.
4. Edit one line in [src/config.ts](src/config.ts):
   ```ts
   export const DEFAULT_SERVER_URL = 'wss://hot-seat-server.onrender.com';
   ```
   (`wss://` not `ws://` — Render terminates TLS for you.)
5. Rebuild/redeploy the app (step 2 below). Every player now gets this URL by default — no one has to type an IP again.

Free-tier Render services sleep after 15 min idle; first connection after a sleep takes ~30s to wake up. Fine for a party game, worth knowing.

## 2. The app itself

**Web (zero install, share a link):**
```bash
npx expo export --platform web
```
This produces a static `dist/` folder (already generated once, ~2.5MB). Drag that folder onto [Netlify Drop](https://app.netlify.com/drop) — no account needed for a one-off, free account for a stable URL. Done: anyone with the link plays immediately, phone or laptop, local pass-and-play works with zero setup, online works once step 1 is done.

**Android (installable APK, no Play Store review needed for v1):**
```bash
npm install -g eas-cli
eas login          # free Expo account
eas build -p android --profile preview
```
`eas build` needs an `eas.json` — run `eas build:configure` first if one doesn't exist yet. Produces a downloadable `.apk` link to share directly; skips app-store review entirely.

**iOS:** needs an Apple Developer account ($99/yr) either way — `eas build -p ios` once that exists. Not free, no way around it; hold off until the game is validated.

## What's already done vs. what's yours to run

Done in this repo: server is deploy-ready (`server/render.yaml`, respects `PORT`), buzzer sound is bundled locally (no runtime network dependency), the server URL is a single constant to edit post-deploy, and a static web build has been proven to export cleanly.

Yours to run: actually creating the Render/Netlify/Expo accounts and clicking deploy — none of that can happen without you being the account holder.
