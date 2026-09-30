import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameState } from '../engine/types';
import { colors, fonts } from '../theme';

/** End-of-game stat tiles: best single turn, top describer, total words. */
export default function Highlights({ state }: { state: GameState }) {
  const log = state.turnLog;
  if (log.length === 0) return null;

  const teamName = (id: string) => state.teams.find((t) => t.id === id)?.name ?? '';
  const best = log.reduce((a, b) => (b.guessed > a.guessed ? b : a));

  const byDescriber = new Map<string, { team: string; total: number }>();
  for (const r of log) {
    if (!r.describer) continue;
    const key = `${r.describer}|${r.teamId}`;
    const cur = byDescriber.get(key) ?? { team: teamName(r.teamId), total: 0 };
    byDescriber.set(key, { ...cur, total: cur.total + r.guessed });
  }
  const top = [...byDescriber.entries()].sort((a, b) => b[1].total - a[1].total)[0];
  const totalWords = log.reduce((n, r) => n + r.guessed, 0);

  const tiles = [
    {
      label: 'BEST TURN',
      value: `${best.guessed} words`,
      sub: best.describer ? `${best.describer} · ${teamName(best.teamId)}` : teamName(best.teamId),
    },
    top && {
      label: 'TOP DESCRIBER',
      value: top[0].split('|')[0],
      sub: `${top[1].total} words · ${top[1].team}`,
    },
    { label: 'WORDS GUESSED', value: String(totalWords), sub: `in ${log.length} turns` },
  ].filter(Boolean) as { label: string; value: string; sub: string }[];

  return (
    <View style={styles.row}>
      {tiles.map((t) => (
        <View key={t.label} style={styles.tile}>
          <Text style={styles.label}>{t.label}</Text>
          <Text style={styles.value} numberOfLines={1}>
            {t.value}
          </Text>
          <Text style={styles.sub} numberOfLines={2}>
            {t.sub}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%', maxWidth: 420, marginTop: 16, justifyContent: 'center' },
  tile: {
    flexGrow: 1,
    flexBasis: 110,
    backgroundColor: colors.paper,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.25)',
  },
  label: { fontFamily: fonts.display, fontSize: 10, letterSpacing: 1.2, color: colors.inkFaint },
  value: { fontFamily: fonts.display, fontSize: 18, color: colors.red, marginTop: 4 },
  sub: { fontFamily: fonts.body, fontSize: 11, color: colors.inkSoft, textAlign: 'center', marginTop: 2 },
});
