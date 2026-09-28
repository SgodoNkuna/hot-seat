import AsyncStorage from '@react-native-async-storage/async-storage';

// Words players flagged as bad/outdated. Cards containing them are left out of future games on this device.
const KEY = 'hotseat:flagged-words';

export async function loadFlags(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function toggleFlag(word: string): Promise<string[]> {
  const flags = await loadFlags();
  const next = flags.includes(word) ? flags.filter((w) => w !== word) : [...flags, word];
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function clearFlags(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
