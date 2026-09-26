import AsyncStorage from '@react-native-async-storage/async-storage';
import { Deck } from '../engine/types';

const STORAGE_KEY = 'thirty-seconds:custom-decks';

export async function loadCustomDecks(): Promise<Deck[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Deck[];
    return parsed.map((d) => ({ ...d, isCustom: true }));
  } catch {
    return [];
  }
}

export async function saveCustomDecks(decks: Deck[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

export function wordsToCards(words: string[]): string[][] {
  const cleaned = words.map((w) => w.trim()).filter(Boolean);
  const cards: string[][] = [];
  for (let i = 0; i < cleaned.length; i += 5) {
    const chunk = cleaned.slice(i, i + 5);
    if (chunk.length === 5) cards.push(chunk);
  }
  return cards;
}

export function createCustomDeck(name: string, words: string[], yellowWords?: string[]): Deck {
  const cardsYellow = yellowWords ? wordsToCards(yellowWords) : undefined;
  return {
    id: `custom-${Date.now()}`,
    name,
    cards: wordsToCards(words),
    ...(cardsYellow && cardsYellow.length > 0 ? { cardsYellow } : {}),
    isCustom: true,
  };
}

const SHARE_PREFIX = 'HOTSEAT-DECK-1:';

/** Encodes a deck as a plain-text code that can be copy-pasted or sent to anyone to import. */
export function encodeDeckShareCode(deck: Deck): string {
  const payload = { name: deck.name, cards: deck.cards, cardsYellow: deck.cardsYellow };
  return SHARE_PREFIX + encodeURIComponent(JSON.stringify(payload));
}

/** Decodes a share code back into an importable deck, or null if it isn't a valid Hot Seat deck code. */
export function decodeDeckShareCode(code: string): Deck | null {
  const trimmed = code.trim();
  if (!trimmed.startsWith(SHARE_PREFIX)) return null;
  try {
    const payload = JSON.parse(decodeURIComponent(trimmed.slice(SHARE_PREFIX.length)));
    if (
      typeof payload.name !== 'string' ||
      !payload.name.trim() ||
      !Array.isArray(payload.cards) ||
      payload.cards.length === 0
    ) {
      return null;
    }
    const cardsYellow = Array.isArray(payload.cardsYellow) && payload.cardsYellow.length > 0 ? payload.cardsYellow : undefined;
    return {
      id: `custom-${Date.now()}`,
      name: payload.name.trim(),
      cards: payload.cards,
      ...(cardsYellow ? { cardsYellow } : {}),
      isCustom: true,
    };
  } catch {
    return null;
  }
}
