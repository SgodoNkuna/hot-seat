# Hot Seat 🎙️

> **BETA** — this is an actively-developed party game. Local pass-and-play is solid; online play needs a server running (see below) and may be rough around the edges.

A retro game-show-styled party word game: teams race the clock to guess 5 words off a card before the buzzer. Play pass-and-play on one phone, or live online across devices.

**[▶ Play it now](https://SgodoNkuna.github.io/hot-seat/)** — works in any browser, no install needed. (Local play works immediately; online play needs the server from the [Deploy](#online-play--server) section running somewhere.)

## Features

- **6 game modes** — Classic, Themed, Blitz, Sudden Death, Elimination, Reverse
- **Flip Cards (Blue/Yellow)** — optional rule where every card has a blue (easier) side and a yellow (harder) side; flip mid-turn if a team gets stuck
- **Custom categories** — build your own word decks, each with an optional yellow "hard mode" side
- **Best of 3 (Marathon)** matches
- **Online multiplayer** — host a room, share a 4-letter code, play live across devices
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
