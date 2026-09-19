import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const BULBS = new Array(9).fill(0);

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.marquee}>
        <View style={styles.bulbRow}>
          {BULBS.map((_, i) => (
            <View key={i} style={[styles.bulb, i % 2 === 0 && styles.bulbLit]} />
          ))}
        </View>
        <View style={styles.marqueeCard}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>♪</Text>
          </View>
          <Text style={styles.title}>HOT SEAT</Text>
          <Text style={styles.tagline}>THE 30-SECOND SHOWDOWN</Text>
          <View style={styles.betaBadge}>
            <Text style={styles.betaBadgeText}>BETA</Text>
          </View>
        </View>
        <View style={[styles.bulbRow, { marginTop: 14 }]}>
          {BULBS.map((_, i) => (
            <View key={i} style={[styles.bulb, i % 2 !== 0 && styles.bulbLit]} />
          ))}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>grab a team, take the mic,{'\n'}beat the buzzer.</Text>

        <Pressable style={styles.button} onPress={() => navigation.navigate('Setup')}>
          <Text style={styles.buttonText}>New Game</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonDark]}
          onPress={() => navigation.navigate('OnlineHome')}
        >
          <Text style={styles.buttonDarkText}>Join Online</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonOutline]}
          onPress={() => navigation.navigate('DeckEditor')}
        >
          <Text style={styles.buttonOutlineText}>Edit Categories</Text>
        </Pressable>

        <Text style={styles.footer}>— EST. FAMILY NIGHT —</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  marquee: {
    height: 220,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulbRow: { flexDirection: 'row', gap: 10 },
  bulb: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.redDark },
  bulbLit: { backgroundColor: colors.gold },
  marqueeCard: {
    width: 300,
    backgroundColor: colors.cream,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 8,
    borderBottomColor: colors.ink,
    marginVertical: 14,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoBadgeText: { color: colors.gold, fontSize: 22 },
  title: { fontFamily: fonts.display, fontSize: 34, color: colors.ink, letterSpacing: 1 },
  tagline: { fontFamily: fonts.bodySemiBold, fontSize: 11, letterSpacing: 3, color: colors.red, marginTop: 8 },
  betaBadge: {
    marginTop: 12,
    backgroundColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  betaBadgeText: { fontFamily: fonts.display, fontSize: 10, letterSpacing: 2, color: colors.gold },
  content: { flex: 1, padding: 28, alignItems: 'center' },
  subtitle: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 15, textAlign: 'center', marginTop: 36, marginBottom: 32 },
  button: {
    width: '100%',
    backgroundColor: colors.gold,
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 5,
    borderBottomColor: colors.goldDark,
  },
  buttonText: { fontFamily: fonts.bodySemiBold, fontSize: 17, color: colors.ink },
  buttonDark: { backgroundColor: colors.ink, borderBottomColor: '#24140D' },
  buttonDarkText: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.cream },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.ink, borderBottomWidth: 2, marginBottom: 0 },
  buttonOutlineText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.ink },
  footer: { marginTop: 'auto', color: colors.inkFaint, fontSize: 11, letterSpacing: 2 },
});
