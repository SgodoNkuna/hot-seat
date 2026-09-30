import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { GameState } from './engine/types';

const FILES = {
  correct: require('../assets/correct.wav'),
  tick: require('../assets/tick.wav'),
  buzzer: require('../assets/buzzer.wav'),
};
type SoundName = keyof typeof FILES;

// players are created on first use, so nothing audio-related runs while the app starts up
const cache: Partial<Record<SoundName, AudioPlayer>> = {};

function play(name: SoundName) {
  try {
    const player = (cache[name] ??= createAudioPlayer(FILES[name]));
    player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    // sound is best-effort (e.g. browser blocked autoplay)
  }
}

function buzz(kind: 'light' | 'tick' | 'end') {
  if (Platform.OS === 'web') return;
  const run =
    kind === 'light'
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      : kind === 'tick'
        ? Haptics.selectionAsync()
        : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  run.catch(() => {});
}

/** Plays a ding per correct word, a tick for each of the last 5 seconds, and the buzzer at time-up. */
export function useGameSounds(state: GameState | null) {
  const prev = useRef<GameState | null>(null);
  useEffect(() => {
    const p = prev.current;
    prev.current = state;
    if (!state || !p) return;
    if (state.isTurnActive && state.guessedThisTurn > p.guessedThisTurn) {
      play('correct');
      buzz('light');
    }
    if (state.isTurnActive && !state.isPaused && state.timeRemaining < p.timeRemaining && state.timeRemaining <= 5 && state.timeRemaining > 0) {
      play('tick');
      buzz('tick');
    }
    if (p.isTurnActive && !state.isTurnActive && state.timeRemaining === 0) {
      play('buzzer');
      buzz('end');
    }
  }, [state]);
}
