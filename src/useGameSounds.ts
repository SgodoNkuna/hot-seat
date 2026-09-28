import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { GameState } from './engine/types';

const FILES = {
  correct: require('../assets/correct.wav'),
  tick: require('../assets/tick.wav'),
  buzzer: require('../assets/buzzer.wav'),
};
type SoundName = keyof typeof FILES;

const cache: Partial<Record<SoundName, Audio.Sound>> = {};

async function play(name: SoundName) {
  try {
    if (!cache[name]) cache[name] = (await Audio.Sound.createAsync(FILES[name])).sound;
    await cache[name]!.replayAsync();
  } catch {
    // sound is best-effort (e.g. browser blocked autoplay)
  }
}

/** Plays a ding per correct word, a tick for each of the last 5 seconds, and the buzzer at time-up. */
export function useGameSounds(state: GameState | null) {
  const prev = useRef<GameState | null>(null);
  useEffect(() => {
    const p = prev.current;
    prev.current = state;
    if (!state || !p) return;
    if (state.isTurnActive && state.guessedThisTurn > p.guessedThisTurn) play('correct');
    if (state.isTurnActive && !state.isPaused && state.timeRemaining < p.timeRemaining && state.timeRemaining <= 5 && state.timeRemaining > 0) play('tick');
    if (p.isTurnActive && !state.isTurnActive && state.timeRemaining === 0) play('buzzer');
  }, [state]);
}
