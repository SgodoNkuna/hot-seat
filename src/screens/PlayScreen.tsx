import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { startTurn, tick, markCorrect, markSkip, endTurn, flipCard, getCurrentTeam } from '../engine/GameEngine';
import CountdownRing from '../components/CountdownRing';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Play'>;

export default function PlayScreen({ navigation }: Props) {
  const { state, update } = useGame();
  const [showTurnCard, setShowTurnCard] = useState(true);
  const cardFade = useRef(new Animated.Value(1)).current;
  const buzzerRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      buzzerRef.current?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (state?.winnerId) {
      navigation.replace('Win');
    }
  }, [state?.winnerId]);

  useEffect(() => {
    if (!state?.isTurnActive) return;
    const interval = setInterval(() => {
      update((s) => tick(s));
    }, 1000);
    return () => clearInterval(interval);
  }, [state?.isTurnActive]);

  useEffect(() => {
    if (state?.timeRemaining === 0 && !state.isTurnActive) {
      playBuzzer();
    }
  }, [state?.timeRemaining, state?.isTurnActive]);

  async function playBuzzer() {
    try {
      const { sound } = await Audio.Sound.createAsync(require('../../assets/buzzer.wav'));
      buzzerRef.current = sound;
      await sound.playAsync();
    } catch {
      // sound is best-effort; ignore failures (e.g. audio permissions denied)
    }
  }

  function handleStartTurn() {
    setShowTurnCard(false);
    update((s) => startTurn(s));
  }

  function handleEndTurnEarly() {
    update((s) => endTurn(s));
    setShowTurnCard(true);
  }

  function handleNextTurnFromRecap() {
    setShowTurnCard(true);
  }

  if (!state) return null;

  const currentTeam = getCurrentTeam(state);
  const cardWords = state.currentCard ?? [];

  if (showTurnCard) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.turnCard, { opacity: cardFade }]}>
          <Text style={styles.upNextLabel}>Up Next</Text>
          <Text style={styles.teamNameBig}>{currentTeam.name}</Text>
          <Text style={styles.roundLabel}>Round {state.round}</Text>
          {state.suddenDeathActive && (
            <Text style={styles.suddenDeathBadge}>⚡ Sudden Death — final round!</Text>
          )}

          <View style={styles.scoreList}>
            {state.teams.map((t) => {
              const eliminated = state.eliminatedTeamIds.includes(t.id);
              return (
                <Text key={t.id} style={[styles.scoreLine, eliminated && styles.scoreLineOut]}>
                  {t.name}: {t.score}
                  {state.config.mode === 'elimination' ? '' : ` / ${state.config.targetScore}`}
                  {eliminated ? '  (OUT)' : ''}
                </Text>
              );
            })}
          </View>

          <Pressable style={styles.startButton} onPress={handleStartTurn}>
            <Text style={styles.startButtonText}>Start 30 Seconds</Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  const turnJustEnded = !state.isTurnActive;

  if (turnJustEnded) {
    return (
      <View style={styles.container}>
        <View style={styles.turnCard}>
          <Text style={styles.upNextLabel}>Time's Up!</Text>
          <Text style={styles.teamNameBig}>{currentTeam.name}</Text>
          <Text style={styles.recapText}>
            Guessed {state.guessedThisTurn} · Skipped {state.skippedThisTurn}
          </Text>
          <Pressable style={styles.startButton} onPress={handleNextTurnFromRecap}>
            <Text style={styles.startButtonText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.teamLabel}>{currentTeam.name}'s Turn</Text>

      <CountdownRing totalSeconds={state.config.turnSeconds} timeRemaining={state.timeRemaining} />

      <View
        style={[
          styles.wordCard,
          state.config.allowFlip && (state.cardSide === 'blue' ? styles.wordCardBlue : styles.wordCardYellow),
        ]}
      >
        {state.config.allowFlip && (
          <Text style={[styles.sideLabel, state.cardSide === 'blue' ? styles.sideLabelBlue : styles.sideLabelYellow]}>
            {state.cardSide === 'blue' ? 'BLUE SIDE' : 'YELLOW SIDE'}
          </Text>
        )}
        {cardWords.map((word, i) => (
          <Text key={i} style={styles.wordText}>
            {word}
          </Text>
        ))}
      </View>

      {state.config.allowFlip && state.currentCardOtherSide && (
        <Pressable
          style={[styles.flipButton, state.cardSide === 'blue' ? styles.flipButtonToYellow : styles.flipButtonToBlue]}
          onPress={() => update((s) => flipCard(s))}
        >
          <Text style={styles.flipButtonText}>
            FLIP TO {state.cardSide === 'blue' ? 'YELLOW' : 'BLUE'}
          </Text>
        </Pressable>
      )}

      <View style={styles.actionRow}>
        {state.config.allowSkip && (
          <Pressable
            style={[styles.actionButton, styles.skipButton]}
            onPress={() => update((s) => markSkip(s))}
          >
            <Text style={styles.actionButtonText}>SKIP</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.actionButton, styles.correctButton]}
          onPress={() => update((s) => markCorrect(s))}
        >
          <Text style={styles.actionButtonTextDark}>RIGHT!</Text>
        </Pressable>
      </View>

      <Pressable style={styles.endEarlyLink} onPress={handleEndTurnEarly}>
        <Text style={styles.endEarlyText}>End turn early</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', padding: 24 },
  teamLabel: { fontFamily: fonts.display, fontSize: 13, letterSpacing: 1.5, color: colors.gold, marginBottom: 22 },
  wordCard: {
    backgroundColor: colors.paper,
    borderRadius: 14,
    padding: 26,
    marginTop: 28,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 8,
    borderBottomColor: 'rgba(0,0,0,0.25)',
  },
  wordCardBlue: { borderTopWidth: 8, borderTopColor: colors.blue },
  wordCardYellow: { borderTopWidth: 8, borderTopColor: colors.yellow },
  sideLabel: { fontFamily: fonts.display, fontSize: 11, letterSpacing: 2, marginBottom: 10 },
  sideLabelBlue: { color: colors.blue },
  sideLabelYellow: { color: colors.yellowDark },
  wordText: { fontFamily: fonts.bodySemiBold, fontSize: 22, color: colors.ink, marginVertical: 6 },
  flipButton: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 999, alignSelf: 'center' },
  flipButtonToYellow: { backgroundColor: colors.yellow, borderBottomWidth: 4, borderBottomColor: colors.yellowDark },
  flipButtonToBlue: { backgroundColor: colors.blue, borderBottomWidth: 4, borderBottomColor: colors.blueDark },
  flipButtonText: { fontFamily: fonts.display, fontSize: 12, letterSpacing: 1, color: colors.cream },
  actionRow: { flexDirection: 'row', gap: 16, marginTop: 30, width: '100%' },
  actionButton: { flex: 1, paddingVertical: 20, borderRadius: 999, alignItems: 'center' },
  skipButton: { backgroundColor: '#5A3A26', borderBottomWidth: 5, borderBottomColor: '#24140D' },
  correctButton: { backgroundColor: colors.red, borderBottomWidth: 6, borderBottomColor: colors.redDark },
  actionButtonText: { fontFamily: fonts.display, fontSize: 15, color: colors.cream },
  actionButtonTextDark: { fontFamily: fonts.display, fontSize: 15, color: colors.cream },
  endEarlyLink: { marginTop: 18 },
  endEarlyText: { color: '#B08A6A', fontSize: 12, letterSpacing: 1, fontFamily: fonts.body },
  turnCard: {
    backgroundColor: colors.paper,
    borderRadius: 18,
    padding: 32,
    width: '100%',
    alignItems: 'center',
  },
  upNextLabel: { color: colors.inkFaint, fontSize: 13, letterSpacing: 2, marginBottom: 8, fontFamily: fonts.bodySemiBold },
  teamNameBig: { fontFamily: fonts.display, color: colors.ink, fontSize: 28, marginBottom: 4 },
  roundLabel: { color: colors.inkFaint, fontSize: 13, marginBottom: 20, fontFamily: fonts.body },
  scoreList: { marginBottom: 24, alignItems: 'center' },
  scoreLine: { color: colors.inkSoft, fontSize: 15, marginVertical: 2, fontFamily: fonts.body },
  scoreLineOut: { color: colors.red, textDecorationLine: 'line-through' },
  suddenDeathBadge: { color: colors.red, fontFamily: fonts.bodySemiBold, fontSize: 13, marginBottom: 12 },
  recapText: { color: colors.inkSoft, fontSize: 16, marginBottom: 24, fontFamily: fonts.body },
  startButton: { backgroundColor: colors.red, paddingVertical: 18, paddingHorizontal: 40, borderRadius: 10, borderBottomWidth: 6, borderBottomColor: colors.redDark },
  startButtonText: { fontFamily: fonts.display, fontSize: 15, color: colors.cream, letterSpacing: 1 },
});
