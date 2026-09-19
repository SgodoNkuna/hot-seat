import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useOnline } from '../online/OnlineContext';
import { DECKS } from '../data/decks';
import { loadCustomDecks } from '../data/customDecks';
import { Deck } from '../engine/types';
import { colors, fonts } from '../theme';
import { DEFAULT_SERVER_URL } from '../config';

type Props = NativeStackScreenProps<RootStackParamList, 'OnlineHome'>;

export default function OnlineHomeScreen({ navigation }: Props) {
  const { connectAndCreate, connectAndJoin, status, room, error, clearError } = useOnline();
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
  const [showServerField, setShowServerField] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [customDecks, setCustomDecks] = useState<Deck[]>([]);
  const [selectedDeckIds, setSelectedDeckIds] = useState<string[]>(DECKS.map((d) => d.id));
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    loadCustomDecks().then((decks) => {
      setCustomDecks(decks);
      setSelectedDeckIds((prev) => [...prev, ...decks.map((d) => d.id)]);
    });
  }, []);

  const allDecks = [...DECKS, ...customDecks];

  function toggleDeck(id: string) {
    setSelectedDeckIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  React.useEffect(() => {
    if (error) {
      setBanner(error);
      clearError();
    }
  }, [error]);

  React.useEffect(() => {
    if (room) {
      navigation.navigate('OnlineLobby'); // ponytail: navigate on confirmed join, not raw socket open
    }
  }, [room]);

  function handleCreate() {
    if (!playerName.trim()) {
      setBanner('Enter your name first.');
      return;
    }
    if (selectedDeckIds.length === 0) {
      setBanner('Select at least one category deck to play with.');
      return;
    }
    setBanner(null);
    connectAndCreate(
      serverUrl,
      playerName.trim(),
      {
        mode: 'classic',
        targetScore: 30,
        turnSeconds: 30,
        deckIds: selectedDeckIds,
        allowSkip: true,
        allowFlip: false,
        matchFormat: 'single',
        suddenDeathMargin: 3,
      },
      customDecks
    );
  }

  function handleJoin() {
    if (!playerName.trim()) {
      setBanner('Enter your name first.');
      return;
    }
    if (!roomCode.trim()) {
      setBanner('Ask the host for the 4-letter room code.');
      return;
    }
    setBanner(null);
    connectAndJoin(serverUrl, playerName.trim(), roomCode.trim().toUpperCase());
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Play Online</Text>
      <Text style={styles.betaNote}>BETA — online play needs a running game server. See the README for setup.</Text>

      {banner && <Text style={styles.banner}>{banner}</Text>}

      <Text style={styles.label}>Your Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Alex"
        placeholderTextColor={colors.inkFaint}
        value={playerName}
        onChangeText={setPlayerName}
      />

      <Pressable onPress={() => setShowServerField((v) => !v)}>
        <Text style={styles.linkText}>{showServerField ? 'Hide' : 'Using a local server instead?'}</Text>
      </Pressable>
      {showServerField && (
        <>
          <Text style={styles.label}>Server Address</Text>
          <TextInput
            style={styles.input}
            placeholder="ws://192.168.1.10:4000"
            placeholderTextColor={colors.inkFaint}
            value={serverUrl}
            onChangeText={setServerUrl}
            autoCapitalize="none"
          />
          <Text style={styles.hint}>
            Use ws://localhost:4000 on the same machine, or the host's LAN IP for other devices.
          </Text>
        </>
      )}

      <Text style={styles.label}>Categories (host only)</Text>
      <View style={styles.optionRow}>
        {allDecks.map((deck) => (
          <Pressable
            key={deck.id}
            style={[styles.optionChip, selectedDeckIds.includes(deck.id) && styles.optionChipActive]}
            onPress={() => toggleDeck(deck.id)}
          >
            <Text
              style={[
                styles.optionChipText,
                selectedDeckIds.includes(deck.id) && styles.optionChipTextActive,
              ]}
            >
              {deck.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.button}
        onPress={handleCreate}
        disabled={status === 'connecting'}
      >
        <Text style={styles.buttonText}>
          {status === 'connecting' ? 'Connecting…' : 'Host a Room'}
        </Text>
      </Pressable>

      <View style={styles.divider} />

      <Text style={styles.label}>Room Code</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. P9B5"
        placeholderTextColor={colors.inkFaint}
        value={roomCode}
        onChangeText={setRoomCode}
        autoCapitalize="characters"
      />
      <Pressable
        style={[styles.button, styles.buttonSecondary]}
        onPress={handleJoin}
        disabled={status === 'connecting'}
      >
        <Text style={styles.buttonTextSecondary}>Join Room</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream, padding: 24, justifyContent: 'center' },
  heading: { fontFamily: fonts.display, fontSize: 24, color: colors.ink, marginBottom: 20, textAlign: 'center' },
  label: { color: colors.inkFaint, fontSize: 12, fontFamily: fonts.bodySemiBold, letterSpacing: 1, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: colors.paper,
    color: colors.ink,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.ink,
    fontFamily: fonts.body,
  },
  hint: { color: colors.inkFaint, fontSize: 11, marginTop: 6, fontFamily: fonts.body },
  betaNote: { color: colors.yellowDark, fontSize: 11, fontFamily: fonts.bodySemiBold, textAlign: 'center', marginBottom: 16, letterSpacing: 0.5 },
  linkText: { color: colors.red, fontSize: 12, fontFamily: fonts.bodySemiBold, marginTop: 14 },
  banner: {
    backgroundColor: colors.red,
    color: colors.cream,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
  },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  optionChip: {
    borderWidth: 2,
    borderColor: colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: colors.paper,
  },
  optionChipActive: { backgroundColor: colors.red, borderColor: colors.red },
  optionChipText: { color: colors.ink, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  optionChipTextActive: { color: colors.cream },
  button: {
    backgroundColor: colors.gold,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    borderBottomWidth: 5,
    borderBottomColor: colors.goldDark,
  },
  buttonSecondary: { backgroundColor: colors.ink, borderBottomColor: '#24140D' },
  buttonText: { fontFamily: fonts.display, fontSize: 15, color: colors.ink },
  buttonTextSecondary: { fontFamily: fonts.display, fontSize: 15, color: colors.cream },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 28 },
});
