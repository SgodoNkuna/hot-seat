import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated , useWindowDimensions } from 'react-native';
import { Audio } from 'expo-av';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import {
  startTurn,
  tick,
  markCorrect,
  markSkip,
  endTurn,
  flipCard,
  nextCard,
  getCurrentTeam,
  adjustScore,
  confirmScore,
} from '../engine/GameEngine';
import CountdownRing from '../components/CountdownRing';
import BoardMap from '../components/BoardMap';
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
    if (state?.winnerId && state.scoreConfirmed) {
      navigation.replace('Win');
    }
  }, [state?.winnerId, state?.scoreConfirmed]);

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
  }

  function handleConfirmScore() {
    update((s) => confirmScore(s));
    setShowTurnCard(true);
  }

  const { height } = useWindowDimensions();
  const compact = height < 760;

  if (!state) return null;

  const currentTeam = getCurrentTeam(state);
  const cardWords = state.currentCard ?? [];
  const sideComplete = state.isTurnActive && state.currentCard !== null && state.pendingIndices.length === 0;
  const canFlip = sideComplete && state.config.allowFlip && !!state.currentCardOtherSide;

  if (showTurnCard) {
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.turnCard, { opacity: cardFade }]}>
          <Text style={styles.upNextLabel}>Up Next</Text>
          <Text style={styles.teamNameBig}>{currentTeam.name}</Text>
          <Text style={styles.roundLabel}>Round {state.round}</Text>
          {state.suddenDeathActive && (
            <Text style={styles.suddenDeathBadge}>⚡ Sudden Death — final round!</Text>
          )}

          {state.config.mode === 'board' && (
            <BoardMap teams={state.teams} target={state.config.targetScore} highlightTeamId={currentTeam.id} />
          )}
          <View style={[state.config.mode === 'board' ? styles.hidden : styles.scoreList]}>
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
      </ScrollView>
    );
  }

  const turnJustEnded = !state.isTurnActive;

  if (turnJustEnded) {
    const lastTeam = state.teams.find((t) => t.id === state.lastTurnTeamId) ?? currentTeam;
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.turnCard}>
          <Text style={styles.upNextLabel}>Time's Up!</Text>
          <Text style={styles.teamNameBig}>{lastTeam.name}</Text>
          <Text style={styles.recapText}>
            Guessed {state.lastTurnGuessed} · Skipped {state.lastTurnSkipped}
          </Text>
          <Text style={styles.scoreBig}>{lastTeam.score} pts</Text>
          {state.config.mode === 'board' && (
            <BoardMap teams={state.teams} target={state.config.targetScore} highlightTeamId={state.lastTurnTeamId}
              startFrom={state.lastTurnTeamId ? { [state.lastTurnTeamId]: lastTeam.score - state.lastTurnGuessed } : undefined}
            />
          )}
          {state.lastTurnWords.length > 0 && (
            <View style={styles.wordChipRow}>
              {state.lastTurnWords.map((word, i) => (
                <View key={i} style={styles.wordChip}>
                  <Text style={styles.wordChipText}>{word}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.confirmHint}>Pass the phone — have the other team check the score</Text>
          <View style={styles.adjustRow}>
            <Pressable style={styles.adjustButton} onPress={() => update((s) => adjustScore(s, -1))}>
              <Text style={styles.adjustButtonText}>−1</Text>
            </Pressable>
            <Pressable style={styles.adjustButton} onPress={() => update((s) => adjustScore(s, 1))}>
              <Text style={styles.adjustButtonText}>+1</Text>
            </Pressable>
          </View>
          <Pressable style={styles.startButton} onPress={handleConfirmScore}>
            <Text style={styles.startButtonText}>Confirm Score</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.teamLabel}>{currentTeam.name}'s Turn</Text>

      <CountdownRing totalSeconds={state.config.turnSeconds} timeRemaining={state.timeRemaining} size={compact ? 120 : 184} />

      <View
        style={[
          styles.wordCard,
          compact && styles.wordCardCompact,
          (state.config.allowFlip || state.config.randomSide) && (state.cardSide === 'blue' ? styles.wordCardBlue : styles.wordCardYellow),
        ]}
      >
        {(state.config.allowFlip || state.config.randomSide) && (
          <Text style={[styles.sideLabel, state.cardSide === 'blue' ? styles.sideLabelBlue : styles.sideLabelYellow]}>
            {state.cardSide === 'blue' ? 'BLUE SIDE' : 'YELLOW SIDE'}
          </Text>
        )}
        {cardWords.map((word, i) => {
          const done = state.completedIndices.includes(i);
          const active = !done && state.pendingIndices[0] === i;
          return (
            <Text key={i} style={[styles.wordText, compact && styles.wordTextCompact, done && styles.wordTextDone, active && styles.wordTextActive]}>
              {word}
            </Text>
          );
        })}
      </View>

      {sideComplete ? (
        <View style={styles.sideCompleteRow}>
          {canFlip && (
            <Pressable
              style={[styles.actionButton, state.cardSide === 'blue' ? styles.flipButtonToYellow : styles.flipButtonToBlue]}
              onPress={() => update((s) => flipCard(s))}
            >
              <Text style={styles.actionButtonTextDark}>
                FLIP TO {state.cardSide === 'blue' ? 'YELLOW' : 'BLUE'}
              </Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.actionButton, styles.correctButton]}
            onPress={() => update((s) => nextCard(s))}
          >
            <Text style={styles.actionButtonTextDark}>NEXT CARD</Text>
          </Pressable>
        </View>
      ) : (
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
      )}

      <Pressable style={styles.endEarlyLink} onPress={handleEndTurnEarly}>
        <Text style={styles.endEarlyText}>End turn early</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.ink },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  hidden: { display: 'none' },
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
  wordCardCompact: { marginTop: 12, paddingVertical: 14 },
  wordTextCompact: { fontSize: 18, marginVertical: 3 },
  wordTextDone: { color: colors.inkFaint, textDecorationLine: 'line-through' },
  wordTextActive: { color: colors.red },
  flipButtonToYellow: { backgroundColor: colors.yellow, borderBottomWidth: 6, borderBottomColor: colors.yellowDark },
  flipButtonToBlue: { backgroundColor: colors.blue, borderBottomWidth: 6, borderBottomColor: colors.blueDark },
  sideCompleteRow: { flexDirection: 'row', gap: 16, marginTop: 30, width: '100%' },
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
  recapText: { color: colors.inkSoft, fontSize: 16, fontFamily: fonts.body },
  scoreBig: { fontFamily: fonts.display, fontSize: 30, color: colors.red, marginTop: 10, marginBottom: 6 },
  confirmHint: { color: colors.inkFaint, fontSize: 12, marginBottom: 16, fontFamily: fonts.body, textAlign: 'center' },
  adjustRow: { flexDirection: 'row', gap: 16, marginBottom: 18 },
  adjustButton: {
    width: 60,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.tan,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.ink,
    borderBottomWidth: 5,
  },
  adjustButtonText: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  wordChipRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 4, marginBottom: 14, maxWidth: '100%' },
  wordChip: { backgroundColor: colors.tan, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  wordChipText: { color: colors.ink, fontSize: 12, fontFamily: fonts.bodySemiBold },
  startButton: { backgroundColor: colors.red, paddingVertical: 18, paddingHorizontal: 40, borderRadius: 10, borderBottomWidth: 6, borderBottomColor: colors.redDark },
  startButtonText: { fontFamily: fonts.display, fontSize: 15, color: colors.cream, letterSpacing: 1 },
});
