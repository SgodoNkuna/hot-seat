import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Switch } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useOnline } from '../online/OnlineContext';
import { GameMode } from '../engine/types';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'OnlineLobby'>;

const TARGET_OPTIONS = [10, 20, 30, 50];
const TURN_OPTIONS = [15, 30];
const MODE_OPTIONS: { id: GameMode; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'themed', label: 'Themed' },
  { id: 'blitz', label: 'Blitz' },
  { id: 'suddenDeath', label: 'Sudden Death' },
  { id: 'elimination', label: 'Elimination' },
  { id: 'reverse', label: 'Reverse' },
];

export default function OnlineLobbyScreen({ navigation }: Props) {
  const { room, playerId, gameState, setTeam, addTeam, updateConfig, startGame, leaveAndDisconnect, error, clearError } =
    useOnline();

  const isHost = room?.hostPlayerId === playerId;

  useEffect(() => {
    if (error) Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
  }, [error]);

  useEffect(() => {
    if (room?.status === 'playing' && gameState) {
      navigation.navigate('OnlinePlay');
    }
  }, [room?.status, gameState]);

  if (!room) return null;

  function handleLeave() {
    leaveAndDisconnect();
    navigation.navigate('Home');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.codeLabel}>Room Code</Text>
      <Text style={styles.code}>{room.code}</Text>
      <Text style={styles.hint}>Share this code so others can join.</Text>

      <Text style={styles.heading}>Teams</Text>
      {room.teams.map((team) => (
        <View key={team.id} style={styles.teamCard}>
          <Text style={styles.teamName}>{team.name}</Text>
          {team.players.length === 0 && <Text style={styles.emptyText}>No players</Text>}
          {team.players.map((p) => (
            <Text key={p.id} style={styles.playerLine}>
              {p.name}
              {p.id === room.hostPlayerId ? '  (host)' : ''}
              {p.id === playerId ? '  ← you' : ''}
            </Text>
          ))}
          <Pressable style={styles.joinTeamButton} onPress={() => setTeam(team.id)}>
            <Text style={styles.joinTeamButtonText}>Join {team.name}</Text>
          </Pressable>
        </View>
      ))}
      {isHost && (
        <Pressable style={styles.linkButton} onPress={addTeam}>
          <Text style={styles.linkButtonText}>+ Add another team</Text>
        </Pressable>
      )}

      {isHost ? (
        <>
          <Text style={styles.heading}>Game Mode</Text>
          <View style={styles.optionRow}>
            {MODE_OPTIONS.map((m) => (
              <Pressable
                key={m.id}
                style={[styles.optionChip, room.config.mode === m.id && styles.optionChipActive]}
                onPress={() => updateConfig({ mode: m.id, turnSeconds: m.id === 'blitz' ? 15 : room.config.turnSeconds })}
              >
                <Text
                  style={[styles.optionChipText, room.config.mode === m.id && styles.optionChipTextActive]}
                >
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {room.config.mode !== 'elimination' && (
            <>
              <Text style={styles.heading}>Win Target</Text>
              <View style={styles.optionRow}>
                {TARGET_OPTIONS.map((val) => (
                  <Pressable
                    key={val}
                    style={[styles.optionChip, room.config.targetScore === val && styles.optionChipActive]}
                    onPress={() => updateConfig({ targetScore: val })}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        room.config.targetScore === val && styles.optionChipTextActive,
                      ]}
                    >
                      {val} pts
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          <Text style={styles.heading}>Turn Length</Text>
          <View style={styles.optionRow}>
            {TURN_OPTIONS.map((val) => (
              <Pressable
                key={val}
                style={[styles.optionChip, room.config.turnSeconds === val && styles.optionChipActive]}
                onPress={() => updateConfig({ turnSeconds: val })}
              >
                <Text
                  style={[styles.optionChipText, room.config.turnSeconds === val && styles.optionChipTextActive]}
                >
                  {val}s
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.heading}>Flip Cards (Blue/Yellow)</Text>
            <Switch
              value={room.config.allowFlip}
              onValueChange={(v) => updateConfig({ allowFlip: v })}
            />
          </View>

          <Pressable style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>START THE SHOW</Text>
          </Pressable>
        </>
      ) : (
        <Text style={styles.waitingText}>Waiting for the host to start the game…</Text>
      )}

      <Pressable style={styles.leaveButton} onPress={handleLeave}>
        <Text style={styles.leaveButtonText}>Leave Room</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, paddingBottom: 60, alignItems: 'center' },
  codeLabel: { color: colors.inkFaint, fontSize: 12, fontFamily: fonts.bodySemiBold, letterSpacing: 1, marginTop: 8 },
  code: {
    fontFamily: fonts.display,
    color: colors.gold,
    fontSize: 40,
    letterSpacing: 8,
    backgroundColor: colors.ink,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  hint: { color: colors.inkFaint, fontSize: 12, marginBottom: 12, marginTop: 8, fontFamily: fonts.body },
  heading: { fontFamily: fonts.display, fontSize: 12, letterSpacing: 1.5, color: colors.ink, marginTop: 20, marginBottom: 10, alignSelf: 'flex-start' },
  teamCard: { backgroundColor: colors.paper, borderRadius: 12, padding: 14, marginBottom: 10, width: '100%', borderWidth: 3, borderColor: colors.ink, borderBottomWidth: 6 },
  teamName: { fontFamily: fonts.display, fontSize: 13, color: colors.red, marginBottom: 6 },
  emptyText: { color: colors.inkFaint, fontSize: 13, marginBottom: 6, fontFamily: fonts.body },
  playerLine: { color: colors.ink, fontSize: 14, marginVertical: 2, fontFamily: fonts.body },
  joinTeamButton: { marginTop: 8, backgroundColor: colors.tan, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  joinTeamButtonText: { color: colors.ink, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  linkButton: { marginTop: 4, alignSelf: 'flex-start' },
  linkButtonText: { color: colors.red, fontSize: 14, fontFamily: fonts.bodySemiBold },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%' },
  optionChip: { borderWidth: 2, borderColor: colors.ink, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.paper },
  optionChipActive: { backgroundColor: colors.red, borderColor: colors.red },
  optionChipText: { color: colors.ink, fontFamily: fonts.bodySemiBold },
  optionChipTextActive: { color: colors.cream },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 20 },
  startButton: { backgroundColor: colors.red, marginTop: 32, paddingVertical: 18, borderRadius: 10, alignItems: 'center', width: '100%', borderBottomWidth: 6, borderBottomColor: colors.redDark },
  startButtonText: { fontFamily: fonts.display, fontSize: 15, color: colors.cream, letterSpacing: 1 },
  waitingText: { color: colors.inkSoft, fontSize: 15, marginTop: 32, textAlign: 'center', fontFamily: fonts.body },
  leaveButton: { marginTop: 24, paddingVertical: 10 },
  leaveButtonText: { color: colors.red, fontSize: 14, fontFamily: fonts.bodySemiBold },
});
