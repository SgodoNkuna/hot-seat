import { Platform } from 'react-native';

// Set EXPO_PUBLIC_SERVER_URL at build time (CI reads the SERVER_URL repo variable), e.g. wss://hot-seat-server.onrender.com
export const DEFAULT_SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || 'ws://localhost:4000';

// Public web address, used for share links and QR codes (also from the Android app).
export const PUBLIC_URL = 'https://sgodonkuna.github.io/hot-seat/';

// GitHub Pages serves the site under /hot-seat/, so screen URLs need that prefix there.
export const WEB_BASE =
  Platform.OS === 'web' && typeof window !== 'undefined' && window.location.pathname.startsWith('/hot-seat') ? 'hot-seat/' : '';
