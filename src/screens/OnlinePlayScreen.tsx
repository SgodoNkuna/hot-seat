import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { Audio } from 'expo-av';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useOnline } from '../online/OnlineContext';
import CountdownRing from '../components/CountdownRing';
import BoardMap from '../components/BoardMap';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'OnlinePlay'>;

export default function OnlinePlayScreen({ navigation }: Props) {
  const { gameState, room, playerId, startTurn, correct, skip, flip, nextCard, endTurn, adjustScore, confirmScore } =
    useOnline();
  const buzzerRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      buzzerRef.current?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (gameState?.winnerId && gameState.scoreConfirmed) {
      navigation.replace('OnlineWin');
    }
  }, [gameState?.winnerId, gameState?.scoreConfirmed]);

  useEffect(() => {
    if (gameState?.timeRemaining === 0 && !gameState.isTurnActive) {
      playBuzzer();
    }
  }, [gameState?.timeRemaining, gameState?.isTurnActive]);

  async function playBuzzer() {
    try {
      const { sound } = await Audio.Sound.createAsync(require('../../assets/buzzer.wav'));
      buzzerRef.current = sound;
      await sound.playAsync();
    } catch {
      // sound is best-effort; ignore failures (e.g. audio permissions denied)
    }
  }

  const { height } = useWindowDimensions();
  const compact = height < 760;

  if (!gameState || !room) return null;

  const currentTeam = gameState.teams[gameState.currentTeamIndex];
  const myTeam = room.teams.find((t) => t.players.some((p) => p.id === playerId));
  const isMyTurn = myTeam?.id === currentTeam.id;
  const cardWords = gameState.currentCard ?? [];
  const sideComplete = gameState.isTurnActive && gameState.currentCard !== null && gameState.pendingIndices.length === 0;
  const canFlip = sideComplete && gameState.config.allowFlip && !!gameState.currentCardOtherSide;

  if (!gameState.isTurnActive && gameState.lastTurnTeamId && !gameState.scoreConfirmed) {
    const lastTeam = gameState.teams.find((t) => t.id === gameState.lastTurnTeamId);
    const isOtherTeam = myTeam && myTeam.id !== gameState.lastTurnTeamId;
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.turnCard}>
          <Text style={styles.upNextLabel}>Time's Up!</Text>
          <Text style={styles.teamNameBig}>{lastTeam?.name}</Text>
          <Text style={styles.recapText}>
            Guessed {gameState.lastTurnGuessed} · Skipped {gameState.lastTurnSkipped}
          </Text>
          <Text style={styles.scoreBig}>{lastTeam?.score} pts</Text>
          {gameState.config.mode === 'board' && (
            <BoardMap teams={gameState.teams} target={gameState.config.targetScore} highlightTeamId={gameState.lastTurnTeamId}
              startFrom={gameState.lastTurnTeamId ? { [gameState.lastTurnTeamId]: (lastTeam?.score ?? 0) - gameState.lastTurnGuessed } : undefined}
            />
          )}
          {gameState.lastTurnWords.length > 0 && (
            <View style={styles.wordChipRow}>
              {gameState.lastTurnWords.map((word, i) => (
                <View key={i} style={styles.wordChip}>
                  <Text style={styles.wordChipText}>{word}</Text>
                </View>
              ))}
            </View>
          )}

          {isOtherTeam ? (
            <>
              <Text style={styles.confirmHint}>Check the score before play continues</Text>
              <View style={styles.adjustRow}>
                <Pressable style={styles.adjustButton} onPress={() => adjustScore(-1)}>
                  <Text style={styles.adjustButtonText}>−1</Text>
                </Pressable>
                <Pressable style={styles.adjustButton} onPress={() => adjustScore(1)}>
                  <Text style={styles.adjustButtonText}>+1</Text>
                </Pressable>
              </View>
              <Pressable style={styles.startButton} onPress={confirmScore}>
                <Text style={styles.startButtonText}>Confirm Score</Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.waitingText}>Waiting for the other team to confirm the score…</Text>
          )}
        </View>
      </ScrollView>
    );
  }

  if (!gameState.isTurnActive && !gameState.currentCard) {
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.turnCard}>
          <Text style={styles.upNextLabel}>Up Next</Text>
          <Text style={styles.teamNameBig}>{currentTeam.name}</Text>
          <Text style={styles.roundLabel}>Round {gameState.round}</Text>
          {gameState.suddenDeathActive && (
            <Text style={styles.suddenDeathBadge}>⚡ Sudden Death — final round!</Text>
          )}

          {gameState.config.mode === 'board' && (
            <BoardMap teams={gameState.teams} target={gameState.config.targetScore} highlightTeamId={currentTeam.id} />
          )}
          <View style={[gameState.config.mode === 'board' ? styles.hidden : styles.scoreList]}>
            {gameState.teams.map((t) => {
              const eliminated = gameState.eliminatedTeamIds.includes(t.id);
              return (
                <Text key={t.id} style={[styles.scoreLine, eliminated && styles.scoreLineOut]}>
                  {t.name}: {t.score}
                  {gameState.config.mode === 'elimination' ? '' : ` / ${gameState.config.targetScore}`}
                  {eliminated ? '  (OUT)' : ''}
                </Text>
              );
            })}
          </View>

          {isMyTurn ? (
            <Pressable style={styles.startButton} onPress={startTurn}>
              <Text style={styles.startButtonText}>Start 30 Seconds</Text>
            </Pressable>
          ) : (
            <Text style={styles.waitingText}>Waiting for {currentTeam.name} to start their turn…</Text>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.teamLabel}>{currentTeam.name}'s Turn</Text>

      <CountdownRing totalSeconds={gameState.config.turnSeconds} timeRemaining={gameState.timeRemaining} size={compact ? 120 : 184} />

      <View
        style={[
          styles.wordCard,
          compact && styles.wordCardCompact,
          (gameState.config.allowFlip || gameState.config.randomSide) && (gameState.cardSide === 'blue' ? styles.wordCardBlue : styles.wordCardYellow),
        ]}
      >
        {(gameState.config.allowFlip || gameState.config.randomSide) && (
          <Text style={[styles.sideLabel, gameState.cardSide === 'blue' ? styles.sideLabelBlue : styles.sideLabelYellow]}>
            {gameState.cardSide === 'blue' ? 'BLUE SIDE' : 'YELLOW SIDE'}
          </Text>
        )}
        {cardWords.map((word, i) => {
          const done = gameState.completedIndices.includes(i);
          const active = !done && gameState.pendingIndices[0] === i;
          return (
            <Text key={i} style={[styles.wordText, compact && styles.wordTextCompact, done && styles.wordTextDone, active && styles.wordTextActive]}>
              {word}
            </Text>
          );
        })}
      </View>

      {isMyTurn ? (
        <>
          {sideComplete ? (
            <View style={styles.sideCompleteRow}>
              {canFlip && (
                <Pressable
                  style={[styles.actionButton, gameState.cardSide === 'blue' ? styles.flipButtonToYellow : styles.flipButtonToBlue]}
                  onPress={flip}
                >
                  <Text style={styles.actionButtonTextDark}>
                    FLIP TO {gameState.cardSide === 'blue' ? 'YELLOW' : 'BLUE'}
                  </Text>
                </Pressable>
              )}
              <Pressable style={[styles.actionButton, styles.correctButton]} onPress={nextCard}>
                <Text style={styles.actionButtonTextDark}>NEXT CARD</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.actionRow}>
              {gameState.config.allowSkip && (
                <Pressable style={[styles.actionButton, styles.skipButton]} onPress={skip}>
                  <Text style={styles.actionButtonText}>SKIP</Text>
                </Pressable>
              )}
              <Pressable style={[styles.actionButton, styles.correctButton]} onPress={correct}>
                <Text style={styles.actionButtonTextDark}>RIGHT!</Text>
              </Pressable>
            </View>
          )}
          <Pressable style={styles.endEarlyLink} onPress={endTurn}>
            <Text style={styles.endEarlyText}>End turn early</Text>
          </Pressable>
        </>
      ) : (
        <Text style={styles.waitingText}>{currentTeam.name} is guessing…</Text>
      )}
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
  turnCard: { backgroundColor: colors.paper, borderRadius: 18, padding: 32, width: '100%', alignItems: 'center' },
  upNextLabel: { color: colors.inkFaint, fontSize: 13, letterSpacing: 2, marginBottom: 8, fontFamily: fonts.bodySemiBold },
  teamNameBig: { fontFamily: fonts.display, color: colors.ink, fontSize: 28, marginBottom: 4 },
  roundLabel: { color: colors.inkFaint, fontSize: 13, marginBottom: 12, fontFamily: fonts.body },
  recapText: { color: colors.inkSoft, fontSize: 15, marginTop: 4, fontFamily: fonts.body },
  scoreBig: { fontFamily: fonts.display, fontSize: 30, color: colors.red, marginTop: 10, marginBottom: 6 },
  confirmHint: { color: colors.inkFaint, fontSize: 12, marginTop: 8, marginBottom: 14, fontFamily: fonts.body, textAlign: 'center' },
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
  suddenDeathBadge: { color: colors.red, fontFamily: fonts.bodySemiBold, fontSize: 13, marginBottom: 12 },
  scoreList: { marginBottom: 24, alignItems: 'center' },
  scoreLine: { color: colors.inkSoft, fontSize: 15, marginVertical: 2, fontFamily: fonts.body },
  scoreLineOut: { color: colors.red, textDecorationLine: 'line-through' },
  startButton: { backgroundColor: colors.red, paddingVertical: 18, paddingHorizontal: 40, borderRadius: 10, borderBottomWidth: 6, borderBottomColor: colors.redDark },
  startButtonText: { fontFamily: fonts.display, fontSize: 15, color: colors.cream, letterSpacing: 1 },
  waitingText: { color: colors.inkSoft, fontSize: 15, marginTop: 12, textAlign: 'center', fontFamily: fonts.body },
});
