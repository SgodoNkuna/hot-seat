# Hot Seat 🎙️

> **BETA** — this is an actively-developed party game. Local pass-and-play is solid; online play needs a server running (see below) and may be rough around the edges.

A retro game-show-styled party word game: teams race the clock to guess 5 words off a card before the buzzer. Play pass-and-play on one phone, or live online across devices.

**[▶ Play it now](https://sgodonkuna.github.io/hot-seat/)** — works in any browser, no install needed. On a phone, use the browser's **Add to Home Screen** to install it like an app (works offline too).

**[📱 Download the Android APK](https://github.com/SgodoNkuna/hot-seat/releases/download/apk-latest/hot-seat.apk)** — always the latest build. Open on an Android phone, download, and allow installing from your browser when asked.

## Features

- **7 game modes** — Classic, Board Map, Themed, Blitz, Sudden Death, Elimination, Reverse
- **574 two-sided cards** across General Knowledge, Movies, Sports, Geography, Entertainment, SA Trending, plus isiZulu, Afrikaans and Sesotho decks
- **Game night niceties** — 3-2-1 countdown, undo last tap, pause, describer rotation, score check by the other team, sounds
- **Random Card Side** — each card can land on blue or yellow
- **Flag a bad card** from the score screen; flagged cards are skipped
- **Flip Cards (Blue/Yellow)** — optional rule where every card has a blue (easier) side and a yellow (harder) side; flip mid-turn if a team gets stuck
- **Custom categories** — build your own word decks, each with an optional yellow "hard mode" side
- **Best of 3 (Marathon)** matches
- **Online multiplayer** — host a room, share a 4-letter code or QR, play live across devices; only the describer sees the card; dropped players can rejoin
- Full retro game-show visual theme: checkerboard curtain, spotlight timer, buzzer that just says "RIGHT!"

## Download / run locally

```bash
git clone https://github.com/SgodoNkuna/hot-seat.git
cd hot-seat
npm install
npm run web      # play in your browser at localhost:8082
# or
npm run android   # or npm run ios, via Expo Go
```

## Online play / server

Online multiplayer needs the WebSocket game server running somewhere reachable by all players. See [DEPLOY.md](DEPLOY.md) for exact steps to deploy it (free on Render) and point the app at it. Until then, "Join Online" defaults to `ws://localhost:4000` for same-machine testing.

## Tech

Expo / React Native (+ react-native-web for the browser build), TypeScript, a plain Node + `ws` WebSocket server for online rooms. See [DEPLOY.md](DEPLOY.md) for the full deployment story (web, Android APK, server).

## License

See [LICENSE](LICENSE).
