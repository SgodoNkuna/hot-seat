import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useOnline } from '../online/OnlineContext';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'OnlineWin'>;

export default function OnlineWinScreen({ navigation }: Props) {
  const { gameState, leaveAndDisconnect } = useOnline();

  if (!gameState) return null;

  const winner = gameState.teams.find((t) => t.id === gameState.winnerId);
  const sorted = [...gameState.teams].sort((a, b) => b.score - a.score);

  function goHome() {
    leaveAndDisconnect();
    navigation.navigate('Home');
  }

  return (
    <View style={styles.container}>
      <View style={styles.trophyBadge}>
        <Svg width={46} height={46} viewBox="0 0 24 24" fill="none">
          <Path d="M8 21h8M12 17v4M6 4h12v3a6 6 0 0 1-12 0V4z" stroke={colors.ink} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M6 5H3v2a4 4 0 0 0 3 3.87M18 5h3v2a4 4 0 0 1-3 3.87" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      </View>
      <Text style={styles.winnerLabel}>AND THE WINNER IS</Text>
      <Text style={styles.winnerText}>{(winner?.name ?? 'A TEAM').toUpperCase()}</Text>

      <View style={styles.scoreBoard}>
        {sorted.map((t, i) => (
          <View key={t.id} style={styles.scoreRow}>
            <Text style={styles.scoreRank}>{i + 1}.</Text>
            <Text style={styles.scoreName}>{t.name}</Text>
            <Text style={styles.scoreValue}>{t.score}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.button} onPress={goHome}>
        <Text style={styles.buttonText}>Home</Text>
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
  scoreBoard: { width: '100%', marginTop: 36, marginBottom: 24 },
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
  button: {
    backgroundColor: colors.ink,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#24140D',
  },
  buttonText: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.cream },
});
