# Deploying Hot Seat

Two pieces, deployed separately: the WebSocket game server, and the app itself.

## 1. Game server (required for online play)

Free host: [Render](https://render.com) (or Fly.io — same idea, different UI).

1. On Render: New → Blueprint → pick this repo. It reads the root `render.yaml` automatically.
2. Deploy. Render gives you a URL like `hot-seat-server.onrender.com`. Opening it in a browser should say "Hot Seat server OK".
3. Tell the builds where it is (no code change needed):
   ```bash
   gh variable set SERVER_URL --repo SgodoNkuna/hot-seat --body "wss://hot-seat-server.onrender.com"
   ```
   (`wss://` not `ws://` — Render terminates TLS for you.)
4. Re-run the two GitHub Actions workflows (or push any commit). The website and the APK now connect to your server by default.

Free-tier Render services sleep after 15 min idle; first connection after a sleep takes ~30s to wake up. Fine for a party game, worth knowing.

## 2. The app itself

**Web (zero install, share a link):**
```bash
npx expo export --platform web
```
This produces a static `dist/` folder (already generated once, ~2.5MB). Drag that folder onto [Netlify Drop](https://app.netlify.com/drop) — no account needed for a one-off, free account for a stable URL. Done: anyone with the link plays immediately, phone or laptop, local pass-and-play works with zero setup, online works once step 1 is done.

**Android APK (automatic):** the `Build Android APK` GitHub Action builds on every push to `main` and publishes to a fixed link:
https://github.com/SgodoNkuna/hot-seat/releases/download/apk-latest/hot-seat.apk

It's signed with a debug key, which is fine for sharing and sideloading but not for the Play Store. Because the key can change between builds, people may need to uninstall the old version before installing a newer APK.

**iOS:** needs an Apple Developer account ($99/yr) either way — `eas build -p ios` once that exists. Not free, no way around it; hold off until the game is validated.

## What's already done vs. what's yours to run

Done in this repo: server is deploy-ready (`server/render.yaml`, respects `PORT`), buzzer sound is bundled locally (no runtime network dependency), the server URL is a single constant to edit post-deploy, and a static web build has been proven to export cleanly.

Yours to run: actually creating the Render/Netlify/Expo accounts and clicking deploy — none of that can happen without you being the account holder.
