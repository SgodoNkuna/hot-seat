import { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

/** A refreshed browser tab loses in-memory game state; send the player Home instead of a blank screen. */
export function useHomeIfMissing(navigation: NavigationProp<ParamListBase>, missing: boolean) {
  useEffect(() => {
    if (missing) navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }, [missing]);
}

/** Ask before the browser back button throws away a game in progress. */
export function useConfirmLeave(navigation: NavigationProp<ParamListBase>, inProgress: boolean) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    return navigation.addListener('beforeRemove', (e) => {
      if (!inProgress) return;
      // replace() to the win screen is not "leaving"
      if (e.data.action.type === 'REPLACE') return;
      if (!window.confirm('Leave this game? Scores will be lost.')) e.preventDefault();
    });
  }, [navigation, inProgress]);
}
