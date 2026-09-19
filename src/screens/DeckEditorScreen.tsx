import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Deck } from '../engine/types';
import { DECKS } from '../data/decks';
import { loadCustomDecks, saveCustomDecks, createCustomDeck, wordsToCards } from '../data/customDecks';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DeckEditor'>;

export default function DeckEditorScreen({}: Props) {
  const [customDecks, setCustomDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [wordsInput, setWordsInput] = useState('');
  const [yellowWordsInput, setYellowWordsInput] = useState('');

  useEffect(() => {
    loadCustomDecks().then((decks) => {
      setCustomDecks(decks);
      setLoading(false);
    });
  }, []);

  async function persist(decks: Deck[]) {
    setCustomDecks(decks);
    await saveCustomDecks(decks);
  }

  function startNewDeck() {
    setEditingId('new');
    setNameInput('');
    setWordsInput('');
    setYellowWordsInput('');
  }

  function startEditDeck(deck: Deck) {
    setEditingId(deck.id);
    setNameInput(deck.name);
    setWordsInput(deck.cards.flat().join(', '));
    setYellowWordsInput(deck.cardsYellow?.flat().join(', ') ?? '');
  }

  function cancelEdit() {
    setEditingId(null);
    setNameInput('');
    setWordsInput('');
    setYellowWordsInput('');
  }

  async function saveDeck() {
    const name = nameInput.trim();
    if (!name) {
      Alert.alert('Name required', 'Give your deck a name.');
      return;
    }
    const words = wordsInput.split(',').map((w) => w.trim()).filter(Boolean);
    if (words.length < 5) {
      Alert.alert('Not enough words', 'Add at least 5 comma-separated words or names (cards are made of 5).');
      return;
    }
    const yellowWords = yellowWordsInput.split(',').map((w) => w.trim()).filter(Boolean);
    const cardsYellow = yellowWords.length >= 5 ? wordsToCards(yellowWords) : undefined;
    if (editingId && editingId !== 'new') {
      const updated = customDecks.map((d) =>
        d.id === editingId
          ? { ...d, name, cards: wordsToCards(words), ...(cardsYellow ? { cardsYellow } : { cardsYellow: undefined }) }
          : d
      );
      await persist(updated);
    } else {
      const deck = createCustomDeck(name, words, yellowWords.length >= 5 ? yellowWords : undefined);
      await persist([...customDecks, deck]);
    }
    cancelEdit();
  }

  async function deleteDeck(id: string) {
    Alert.alert('Delete deck', 'Remove this deck permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await persist(customDecks.filter((d) => d.id !== id));
        },
      },
    ]);
  }

  if (loading) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>HOUSE CATEGORIES</Text>
      <View style={styles.builtInGrid}>
        {DECKS.map((deck) => (
          <View key={deck.id} style={styles.builtInTile}>
            <Text style={styles.builtInName}>{deck.name}</Text>
            <Text style={styles.builtInMeta}>{deck.cards.length} cards</Text>
          </View>
        ))}
      </View>

      <Text style={styles.heading}>YOUR CATEGORIES</Text>
      {customDecks.length === 0 && <Text style={styles.emptyText}>No custom categories yet.</Text>}
      {customDecks.map((deck) => (
        <View key={deck.id} style={styles.deckCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.deckName}>{deck.name}</Text>
            <Text style={styles.deckMeta}>{deck.cards.length} cards</Text>
          </View>
          <Pressable onPress={() => startEditDeck(deck)} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>Edit</Text>
          </Pressable>
          <Pressable onPress={() => deleteDeck(deck.id)} style={styles.iconButton}>
            <Text style={[styles.iconButtonText, styles.deleteText]}>Delete</Text>
          </Pressable>
        </View>
      ))}

      {editingId ? (
        <View style={styles.editCard}>
          <Text style={styles.heading}>{editingId === 'new' ? 'New Category' : 'Edit Category'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Category name"
            placeholderTextColor={colors.inkFaint}
            value={nameInput}
            onChangeText={setNameInput}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Blue side: words or names, separated by commas (needs multiples of 5)"
            placeholderTextColor={colors.inkFaint}
            value={wordsInput}
            onChangeText={setWordsInput}
            multiline
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Yellow side (optional, harder words) — same comma format, needs multiples of 5"
            placeholderTextColor={colors.inkFaint}
            value={yellowWordsInput}
            onChangeText={setYellowWordsInput}
            multiline
          />
          <Text style={styles.hintText}>
            Leave the yellow side blank if you don't want this category to support the Flip Cards rule.
          </Text>
          <View style={styles.editActionsRow}>
            <Pressable style={styles.saveButton} onPress={saveDeck}>
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={cancelEdit}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={styles.newDeckButton} onPress={startNewDeck}>
          <Text style={styles.newDeckButtonText}>+ New Category</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, paddingBottom: 60 },
  heading: { fontFamily: fonts.display, fontSize: 12, letterSpacing: 1.5, color: colors.ink, marginTop: 20, marginBottom: 12 },
  emptyText: { color: colors.inkFaint, fontSize: 14, marginBottom: 8, fontFamily: fonts.body },
  builtInGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  builtInTile: {
    width: '47%',
    backgroundColor: colors.red,
    borderRadius: 10,
    padding: 14,
    borderBottomWidth: 5,
    borderBottomColor: colors.redDark,
  },
  builtInName: { fontFamily: fonts.display, fontSize: 13, color: colors.cream, lineHeight: 18 },
  builtInMeta: { fontSize: 11, color: '#F5C8B8', marginTop: 6, fontFamily: fonts.body },
  deckCard: {
    backgroundColor: colors.paper,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: colors.ink,
    borderStyle: 'dashed',
  },
  deckName: { color: colors.ink, fontFamily: fonts.bodySemiBold, fontSize: 15 },
  deckMeta: { color: colors.inkFaint, fontSize: 12, marginTop: 2, fontFamily: fonts.body },
  iconButton: { paddingHorizontal: 10, paddingVertical: 6 },
  iconButtonText: { color: colors.red, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  deleteText: { color: colors.inkFaint },
  newDeckButton: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  newDeckButtonText: { color: colors.ink, fontFamily: fonts.bodySemiBold },
  editCard: { backgroundColor: colors.paper, borderRadius: 12, padding: 16, marginTop: 8, borderWidth: 3, borderColor: colors.ink },
  input: {
    backgroundColor: colors.cream,
    color: colors.ink,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.ink,
    fontFamily: fonts.body,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  hintText: { color: colors.inkFaint, fontSize: 12, fontFamily: fonts.body, marginBottom: 10 },
  editActionsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  saveButton: { flex: 1, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 10, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: colors.goldDark },
  saveButtonText: { color: colors.ink, fontFamily: fonts.bodySemiBold },
  cancelButton: { flex: 1, backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.ink, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  cancelButtonText: { color: colors.ink, fontFamily: fonts.bodySemiBold },
});
