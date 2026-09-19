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
