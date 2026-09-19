import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Win'>;

export default function WinScreen({ navigation }: Props) {
  const { state, match, recordMatchWinAndContinue, startNextMatchGame, clearMatch } = useGame();
  const scale = useRef(new Animated.Value(0.6)).current;
  const [outcome, setOutcome] = useState<'next' | 'champion' | null>(null);
  const recordedRef = useRef(false);

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
  }, []);

  const isMarathon = state?.config.matchFormat === 'bestOf3';

  useEffect(() => {
    if (isMarathon && match && !recordedRef.current) {
      recordedRef.current = true;
      setOutcome(recordMatchWinAndContinue());
    }
  }, [isMarathon, match, recordMatchWinAndContinue]);

  if (!state) return null;

  const winner = state.teams.find((t) => t.id === state.winnerId);
  const sorted = [...state.teams].sort((a, b) => b.score - a.score);

  function playAgain() {
    clearMatch();
    navigation.navigate('Setup');
  }

  function goHome() {
    clearMatch();
    navigation.navigate('Home');
  }

  function nextMatch() {
    startNextMatchGame();
    navigation.navigate('Play');
  }

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
        <View style={styles.trophyBadge}>
          <Svg width={46} height={46} viewBox="0 0 24 24" fill="none">
            <Path d="M8 21h8M12 17v4M6 4h12v3a6 6 0 0 1-12 0V4z" stroke={colors.ink} strokeWidth={2} strokeLinejoin="round" />
            <Path d="M6 5H3v2a4 4 0 0 0 3 3.87M18 5h3v2a4 4 0 0 1-3 3.87" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </View>
        <Text style={styles.winnerLabel}>AND THE WINNER IS</Text>
        <Text style={styles.winnerText}>
          {(winner?.name ?? 'A TEAM').toUpperCase()}{isMarathon ? ` — MATCH ${match?.matchNumber ?? 1}` : ''}
        </Text>
      </Animated.View>

      <View style={styles.scoreBoard}>
        {sorted.map((t, i) => (
          <View key={t.id} style={styles.scoreRow}>
            <Text style={styles.scoreRank}>{i + 1}.</Text>
            <Text style={styles.scoreName}>{t.name}</Text>
            <Text style={styles.scoreValue}>{t.score}</Text>
          </View>
        ))}
      </View>

      {isMarathon && match && (
        <View style={styles.matchWinsBoard}>
          <Text style={styles.matchWinsHeading}>Match Wins</Text>
          {state.teams.map((t) => (
            <Text key={t.id} style={styles.matchWinsLine}>
              {t.name}: {match.matchWins[t.id] ?? 0}
            </Text>
          ))}
        </View>
      )}

      {isMarathon && outcome === 'next' ? (
        <Pressable style={styles.button} onPress={nextMatch}>
          <Text style={styles.buttonText}>Next Match</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.button} onPress={playAgain}>
          <Text style={styles.buttonText}>Play Again</Text>
        </Pressable>
      )}
      <Pressable style={[styles.button, styles.buttonSecondary]} onPress={goHome}>
        <Text style={styles.buttonTextSecondary}>Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center', padding: 24 },
  trophyBadge: {
    width: 92,
    height: 92,
    borderRadius: 999,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 8,
    borderBottomColor: colors.goldDark,
    marginBottom: 18,
  },
  winnerLabel: { fontFamily: fonts.display, fontSize: 12, letterSpacing: 2, color: colors.cream, marginBottom: 6 },
  winnerText: { fontFamily: fonts.display, fontSize: 26, color: colors.cream, textAlign: 'center' },
  scoreBoard: { width: '100%', marginTop: 36, marginBottom: 16 },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderBottomWidth: 5,
    borderBottomColor: colors.redDark,
  },
  scoreRank: { fontFamily: fonts.display, color: colors.goldDark, width: 28, fontSize: 14 },
  scoreName: { color: colors.ink, fontFamily: fonts.bodySemiBold, flex: 1 },
  scoreValue: { fontFamily: fonts.display, color: colors.ink, fontSize: 18 },
  matchWinsBoard: { width: '100%', backgroundColor: colors.paper, borderRadius: 10, padding: 14, marginBottom: 24 },
  matchWinsHeading: { color: colors.inkFaint, fontFamily: fonts.bodySemiBold, marginBottom: 6, fontSize: 12, letterSpacing: 1 },
  matchWinsLine: { color: colors.ink, fontSize: 14, marginVertical: 2, fontFamily: fonts.body },
  button: {
    backgroundColor: colors.ink,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#24140D',
  },
  buttonSecondary: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.cream, borderBottomWidth: 2 },
  buttonText: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.cream },
  buttonTextSecondary: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.cream },
});
