import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'HowToPlay'>;

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: 'The basics',
    body: [
      'Split into teams of 2 or more. Teams take turns.',
      'One player is the describer. They see a card with 5 words and have 30 seconds to get their team to say them.',
      "Describe, act, give clues — but don't say the word itself, part of it, or 'sounds like'.",
      'Tap RIGHT! for each word guessed. Stuck? SKIP moves that word to the back of the card.',
    ],
  },
  {
    title: 'After each turn',
    body: [
      'Pass the phone to the other team. They check the score, fix it with −1 / +1 if needed, and tap Confirm.',
      'Tap any word on the score screen to flag a bad or outdated card; it will not come up again on this phone.',
      'The describer role rotates through each team, so everyone gets a go.',
    ],
  },
  {
    title: 'Blue and yellow sides',
    body: [
      'Every card has a blue (easier) side and a yellow (harder) side.',
      'Difficulty: Easy shows blue, Hard shows yellow, Mixed picks at random.',
      'With Flip Cards on, clear every word on one side and you may flip for 5 more.',
    ],
  },
  {
    title: 'Game modes',
    body: [
      'Classic — first team to the target score wins.',
      'Board Map — race your piece to WIN. ⭐ jumps you 2, ⚠ sends you back 3, 🎯 steals a point from the leader.',
      'Themed — one category only. Blitz — 15-second turns.',
      'Sudden Death — a final round once someone gets close. Elimination — lowest team is out each round.',
      'Reverse — one word per card, rapid fire.',
    ],
  },
  {
    title: 'Handy buttons',
    body: [
      'PAUSE hides the words and stops the clock. Undo reverses a mis-tapped RIGHT! or SKIP.',
      'Your setup is remembered for next time; tap Start fresh to clear it.',
    ],
  },
  {
    title: 'Playing online',
    body: [
      'One person taps Join Online → Host a Room and shares the code or QR.',
      'Everyone joins on their own phone and picks a team. Only the describer sees the card; teammates shout guesses.',
      'Dropped out? Open Join Online again and tap Rejoin — your seat is kept for 10 minutes.',
    ],
  },
];

export default function HowToPlayScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {SECTIONS.map((s) => (
        <View key={s.title} style={styles.card}>
          <Text style={styles.title}>{s.title.toUpperCase()}</Text>
          {s.body.map((line, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.text}>{line}</Text>
            </View>
          ))}
        </View>
      ))}
      <Pressable style={styles.button} onPress={() => navigation.navigate('Setup')}>
        <Text style={styles.buttonText}>LET'S PLAY</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, paddingBottom: 48, gap: 12 },
  card: {
    backgroundColor: colors.paper,
    borderRadius: 12,
    padding: 16,
    borderWidth: 3,
    borderColor: colors.ink,
    borderBottomWidth: 6,
  },
  title: { fontFamily: fonts.display, fontSize: 13, letterSpacing: 1.5, color: colors.red, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginVertical: 3 },
  bullet: { color: colors.red, fontFamily: fonts.bodySemiBold, fontSize: 15 },
  text: { flex: 1, color: colors.ink, fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
  button: {
    backgroundColor: colors.red,
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
    borderBottomWidth: 6,
    borderBottomColor: colors.redDark,
    marginTop: 8,
  },
  buttonText: { fontFamily: fonts.display, fontSize: 16, color: colors.cream, letterSpacing: 1 },
});
