import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Switch, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { DECKS } from '../data/decks';
import { loadCustomDecks } from '../data/customDecks';
import { Deck, GameMode, MatchFormat, Team } from '../engine/types';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Setup'>;

const TARGET_OPTIONS = [10, 20, 30, 50];

const MODES: { id: GameMode; label: string; blurb: string; fixedTurnSeconds?: number }[] = [
  { id: 'classic', label: 'Classic', blurb: 'First team to the target score wins.' },
  { id: 'themed', label: 'Themed', blurb: 'Classic rules, locked to one category.' },
  { id: 'blitz', label: 'Blitz', blurb: '15-second turns, fast and chaotic.', fixedTurnSeconds: 15 },
  { id: 'suddenDeath', label: 'Sudden Death', blurb: 'Final showdown round once a team gets close to winning.' },
  { id: 'elimination', label: 'Elimination', blurb: 'Lowest scorer is cut each round until one team remains.' },
  { id: 'reverse', label: 'Reverse', blurb: 'One word per card — quick-fire single guesses.' },
];

export default function SetupScreen({ navigation }: Props) {
  const { beginMatch } = useGame();
  const [teams, setTeams] = useState<Team[]>([
    { id: 't1', name: 'Team 1', players: [], score: 0 },
    { id: 't2', name: 'Team 2', players: [], score: 0 },
  ]);
  const [playerInput, setPlayerInput] = useState('');
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [mode, setMode] = useState<GameMode>('classic');
  const [targetScore, setTargetScore] = useState(30);
  const [turnSeconds, setTurnSeconds] = useState(30);
  const [allowSkip, setAllowSkip] = useState(true);
  const [allowFlip, setAllowFlip] = useState(false);
  const [matchFormat, setMatchFormat] = useState<MatchFormat>('single');
  const [customDecks, setCustomDecks] = useState<Deck[]>([]);
  const [selectedDecks, setSelectedDecks] = useState<string[]>(DECKS.map((d) => d.id));

  useEffect(() => {
    loadCustomDecks().then(setCustomDecks);
  }, []);

  const allDecks = [...DECKS, ...customDecks];
  const currentModeDef = MODES.find((m) => m.id === mode)!;

  function addTeam() {
    const nextNum = teams.length + 1;
    setTeams([...teams, { id: `t${nextNum}`, name: `Team ${nextNum}`, players: [], score: 0 }]);
  }

  function removeTeam(index: number) {
    if (teams.length <= 2) return;
    setTeams(teams.filter((_, i) => i !== index));
    if (activeTeamIndex >= teams.length - 1) setActiveTeamIndex(0);
  }

  function addPlayer() {
    const name = playerInput.trim();
    if (!name) return;
    setTeams((prev) =>
      prev.map((t, i) => (i === activeTeamIndex ? { ...t, players: [...t.players, name] } : t))
    );
    setPlayerInput('');
  }

  function removePlayer(teamIndex: number, playerIndex: number) {
    setTeams((prev) =>
      prev.map((t, i) =>
        i === teamIndex ? { ...t, players: t.players.filter((_, pi) => pi !== playerIndex) } : t
      )
    );
  }

  function selectMode(id: GameMode) {
    setMode(id);
    const def = MODES.find((m) => m.id === id)!;
    if (def.fixedTurnSeconds) setTurnSeconds(def.fixedTurnSeconds);
    if (id === 'themed' && selectedDecks.length !== 1) {
      setSelectedDecks(selectedDecks.slice(0, 1).length ? selectedDecks.slice(0, 1) : [DECKS[0].id]);
    }
  }

  function toggleDeck(id: string) {
    if (mode === 'themed') {
      setSelectedDecks([id]);
      return;
    }
    setSelectedDecks((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  function startGame() {
    const missingPlayers = teams.some((t) => t.players.length === 0);
    if (missingPlayers) {
      Alert.alert('Add players', 'Every team needs at least one player.');
      return;
    }
    if (selectedDecks.length === 0) {
      Alert.alert('Pick a deck', 'Select at least one category deck to play with.');
      return;
    }
    beginMatch(
      teams,
      {
        mode,
        targetScore,
        turnSeconds,
        deckIds: selectedDecks,
        allowSkip,
        allowFlip,
        matchFormat,
        suddenDeathMargin: 3,
      },
      allDecks
    );
    navigation.navigate('Play');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Game Mode</Text>
      <View style={styles.optionRow}>
        {MODES.map((m) => (
          <Pressable
            key={m.id}
            style={[styles.optionChip, mode === m.id && styles.optionChipActive]}
            onPress={() => selectMode(m.id)}
          >
            <Text style={[styles.optionChipText, mode === m.id && styles.optionChipTextActive]}>
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.blurbText}>{currentModeDef.blurb}</Text>

      <Text style={styles.heading}>Teams &amp; Players</Text>
      {teams.map((team, index) => (
        <View key={team.id} style={styles.teamCard}>
          <View style={styles.teamHeaderRow}>
            <Pressable onPress={() => setActiveTeamIndex(index)}>
              <Text style={[styles.teamName, activeTeamIndex === index && styles.teamNameActive]}>
                {team.name}
              </Text>
            </Pressable>
            {teams.length > 2 && (
              <Pressable onPress={() => removeTeam(index)}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.playerChipRow}>
            {team.players.map((p, pi) => (
              <Pressable key={pi} style={styles.chip} onPress={() => removePlayer(index, pi)}>
                <Text style={styles.chipText}>{p} ✕</Text>
              </Pressable>
            ))}
            {team.players.length === 0 && <Text style={styles.emptyText}>No players yet</Text>}
          </View>
        </View>
      ))}

      <View style={styles.addPlayerRow}>
        <TextInput
          style={styles.input}
          placeholder={`Add player to ${teams[activeTeamIndex]?.name ?? 'team'}`}
          placeholderTextColor={colors.inkFaint}
          value={playerInput}
          onChangeText={setPlayerInput}
          onSubmitEditing={addPlayer}
        />
        <Pressable style={styles.smallButton} onPress={addPlayer}>
          <Text style={styles.smallButtonText}>Add</Text>
        </Pressable>
      </View>

      <Pressable style={styles.linkButton} onPress={addTeam}>
        <Text style={styles.linkButtonText}>+ Add another team</Text>
      </Pressable>

      {mode !== 'elimination' && (
        <>
          <Text style={styles.heading}>Win Target</Text>
          <View style={styles.optionRow}>
            {TARGET_OPTIONS.map((val) => (
              <Pressable
                key={val}
                style={[styles.optionChip, targetScore === val && styles.optionChipActive]}
                onPress={() => setTargetScore(val)}
              >
                <Text style={[styles.optionChipText, targetScore === val && styles.optionChipTextActive]}>
                  {val} pts
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {!currentModeDef.fixedTurnSeconds && (
        <>
          <Text style={styles.heading}>Turn Length</Text>
          <View style={styles.optionRow}>
            {[15, 30].map((val) => (
              <Pressable
                key={val}
                style={[styles.optionChip, turnSeconds === val && styles.optionChipActive]}
                onPress={() => setTurnSeconds(val)}
              >
                <Text style={[styles.optionChipText, turnSeconds === val && styles.optionChipTextActive]}>
                  {val}s
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <View style={styles.switchRow}>
        <Text style={styles.heading}>Allow Skip</Text>
        <Switch value={allowSkip} onValueChange={setAllowSkip} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.heading}>Flip Cards (Blue/Yellow)</Text>
        <Switch value={allowFlip} onValueChange={setAllowFlip} />
      </View>
      {allowFlip && (
        <Text style={styles.blurbText}>
          Each card has a blue (easier) side and a yellow (harder) side — flip mid-turn if a team gets stuck.
        </Text>
      )}

      <View style={styles.switchRow}>
        <Text style={styles.heading}>Best of 3 (Marathon)</Text>
        <Switch
          value={matchFormat === 'bestOf3'}
          onValueChange={(v) => setMatchFormat(v ? 'bestOf3' : 'single')}
        />
      </View>

      <Text style={styles.heading}>
        {mode === 'themed' ? 'Category (pick one)' : 'Categories'}
      </Text>
      <View style={styles.optionRow}>
        {allDecks.map((deck) => (
          <Pressable
            key={deck.id}
            style={[styles.optionChip, selectedDecks.includes(deck.id) && styles.optionChipActive]}
            onPress={() => toggleDeck(deck.id)}
          >
            <Text
              style={[
                styles.optionChipText,
                selectedDecks.includes(deck.id) && styles.optionChipTextActive,
              ]}
            >
              {deck.name}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.linkButton} onPress={() => navigation.navigate('DeckEditor')}>
        <Text style={styles.linkButtonText}>+ Manage custom decks</Text>
      </Pressable>

      <Pressable style={styles.startButton} onPress={startGame}>
        <Text style={styles.startButtonText}>START THE SHOW</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, paddingBottom: 60 },
  heading: { fontFamily: fonts.display, fontSize: 13, letterSpacing: 1.5, color: colors.ink, marginTop: 22, marginBottom: 10 },
  blurbText: { color: colors.inkSoft, fontSize: 13, marginTop: 4, fontFamily: fonts.body },
  teamCard: { backgroundColor: colors.paper, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 3, borderColor: colors.ink, borderBottomWidth: 6 },
  teamHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  teamName: { fontFamily: fonts.display, fontSize: 13, color: colors.inkFaint },
  teamNameActive: { color: colors.red },
  removeText: { color: colors.red, fontSize: 13, fontFamily: fonts.bodySemiBold },
  playerChipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 },
  chip: { backgroundColor: colors.tan, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipText: { color: colors.ink, fontSize: 13, fontFamily: fonts.bodySemiBold },
  emptyText: { color: colors.inkFaint, fontSize: 13, fontFamily: fonts.body },
  addPlayerRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  input: {
    flex: 1,
    backgroundColor: colors.paper,
    color: colors.ink,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: colors.ink,
    fontFamily: fonts.body,
  },
  smallButton: {
    backgroundColor: colors.gold,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 10,
    borderBottomWidth: 4,
    borderBottomColor: colors.goldDark,
  },
  smallButtonText: { color: colors.ink, fontFamily: fonts.bodySemiBold },
  linkButton: { marginTop: 12 },
  linkButtonText: { color: colors.red, fontSize: 14, fontFamily: fonts.bodySemiBold },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: {
    borderWidth: 2,
    borderColor: colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.paper,
  },
  optionChipActive: { backgroundColor: colors.red, borderColor: colors.red },
  optionChipText: { color: colors.ink, fontFamily: fonts.bodySemiBold },
  optionChipTextActive: { color: colors.cream },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 4 },
  startButton: {
    backgroundColor: colors.red,
    marginTop: 32,
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
    borderBottomWidth: 6,
    borderBottomColor: colors.redDark,
  },
  startButtonText: { fontFamily: fonts.display, fontSize: 16, color: colors.cream, letterSpacing: 1 },
});
