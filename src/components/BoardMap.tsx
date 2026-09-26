import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform, LayoutChangeEvent, useWindowDimensions } from 'react-native';
import { Team } from '../engine/types';
import { colors, fonts } from '../theme';

const PIECE_COLORS = ['#D94F30', '#2F6690', '#E8A33D', '#3C8D5A', '#7B4B94', '#3A2318'];
const PER_ROW = 6;
const GAP = 4;
const PIECE = 18;
const STEP_MS = 260;
const native = Platform.OS !== 'web';

interface Props {
  teams: Team[];
  target: number;
  highlightTeamId?: string | null;
  /** Where each team's piece starts before hopping to its current score (e.g. its score before this turn). */
  startFrom?: Record<string, number>;
}

function squareCenter(sq: number, size: number, rowCount: number) {
  const row = Math.floor(sq / PER_ROW);
  const within = sq % PER_ROW;
  // snake: even rows run left→right, odd rows right→left; row 0 sits at the bottom
  const col = row % 2 === 0 ? within : PER_ROW - 1 - within;
  return {
    x: col * (size + GAP) + size / 2,
    y: (rowCount - 1 - row) * (size + GAP) + size / 2,
  };
}

export default function BoardMap({ teams, target, highlightTeamId, startFrom }: Props) {
  const [width, setWidth] = useState(0);
  const [, rerender] = useState(0);
  const rowCount = Math.ceil((target + 1) / PER_ROW);
  const { width: screenW } = useWindowDimensions();
  // estimate from the screen until the real width is measured, so the board never renders empty
  const boardW = width || Math.min(360, screenW - 96);
  const size = boardW > 0 ? (boardW - GAP * (PER_ROW - 1)) / PER_ROW : 0;

  const clamp = (n: number) => Math.max(0, Math.min(n, target));
  const shownSquare = useRef<Record<string, number>>({});
  const pos = useRef<Record<string, Animated.ValueXY>>({});
  const hop = useRef<Record<string, Animated.Value>>({});
  const pulse = useRef(new Animated.Value(0)).current;
  const winGlow = useRef(new Animated.Value(0)).current;

  const offsetFor = (ti: number) => ({ x: (ti % 3) * 7 - 7, y: Math.floor(ti / 3) * 7 - 3 });

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: native }),
        Animated.timing(pulse, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: native }),
      ])
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(winGlow, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(winGlow, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    );
    loop.start();
    glow.start();
    return () => {
      loop.stop();
      glow.stop();
    };
  }, []);

  // walk each piece square-by-square from where it's shown to its current score
  useEffect(() => {
    if (!size) return;
    teams.forEach((t, ti) => {
      const off = offsetFor(ti);
      const to = clamp(t.score);
      if (!pos.current[t.id]) {
        const start = clamp(startFrom?.[t.id] ?? t.score);
        const c = squareCenter(start, size, rowCount);
        pos.current[t.id] = new Animated.ValueXY({ x: c.x + off.x, y: c.y + off.y });
        hop.current[t.id] = new Animated.Value(0);
        shownSquare.current[t.id] = start;
        rerender((n) => n + 1);
      }
      const from = shownSquare.current[t.id];
      if (from === to) {
        const c = squareCenter(to, size, rowCount);
        pos.current[t.id].setValue({ x: c.x + off.x, y: c.y + off.y });
        return;
      }
      const dir = to > from ? 1 : -1;
      const steps: Animated.CompositeAnimation[] = [];
      for (let sq = from + dir; dir > 0 ? sq <= to : sq >= to; sq += dir) {
        const c = squareCenter(sq, size, rowCount);
        steps.push(
          Animated.parallel([
            Animated.timing(pos.current[t.id], {
              toValue: { x: c.x + off.x, y: c.y + off.y },
              duration: STEP_MS,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: false,
            }),
            Animated.sequence([
              Animated.timing(hop.current[t.id], { toValue: 1, duration: STEP_MS / 2, easing: Easing.out(Easing.quad), useNativeDriver: false }),
              Animated.timing(hop.current[t.id], { toValue: 0, duration: STEP_MS / 2, easing: Easing.in(Easing.quad), useNativeDriver: false }),
            ]),
          ])
        );
      }
      shownSquare.current[t.id] = to;
      Animated.sequence([Animated.delay(350), ...steps]).start();
    });
  }, [size, teams.map((t) => t.score).join(','), target]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (Math.abs(w - width) > 1) setWidth(w);
  };

  const squares = Array.from({ length: target + 1 }, (_, i) => i);
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });
  const winBg = winGlow.interpolate({ inputRange: [0, 1], outputRange: [colors.red, '#F07A55'] });

  return (
    <View style={styles.wrap}>
      <View style={[styles.board, { height: size ? rowCount * (size + GAP) - GAP : 0 }]} onLayout={onLayout}>
        {size > 0 &&
          squares.map((sq) => {
            const c = squareCenter(sq, size, rowCount);
            const isStart = sq === 0;
            const isFinish = sq === target;
            return (
              <Animated.View
                key={sq}
                style={[
                  styles.square,
                  { width: size, height: size, left: c.x - size / 2, top: c.y - size / 2 },
                  sq % 2 === 0 ? styles.squareBlue : styles.squareYellow,
                  isStart && styles.squareStart,
                  isFinish && { backgroundColor: winBg },
                ]}
              >
                <Text style={[styles.squareNum, (isStart || isFinish) && styles.squareNumLight]}>
                  {isStart ? 'GO' : isFinish ? 'WIN' : sq}
                </Text>
              </Animated.View>
            );
          })}
        {size > 0 &&
          teams.map((t, ti) => {
            const p = pos.current[t.id];
            if (!p) return null;
            const lift = hop.current[t.id].interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
            const active = t.id === highlightTeamId;
            return (
              <Animated.View
                key={t.id}
                pointerEvents="none"
                style={[
                  styles.piece,
                  {
                    backgroundColor: PIECE_COLORS[ti % PIECE_COLORS.length],
                    zIndex: active ? 10 : 5,
                    transform: [
                      { translateX: Animated.subtract(p.x, PIECE / 2) },
                      { translateY: Animated.add(Animated.subtract(p.y, PIECE / 2), lift) },
                      { scale: active ? pulseScale : 1 },
                    ],
                  },
                  active && styles.pieceActive,
                ]}
              >
                <Text style={styles.pieceText}>{ti + 1}</Text>
              </Animated.View>
            );
          })}
      </View>
      <View style={styles.legend}>
        {teams.map((t, ti) => (
          <View key={t.id} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PIECE_COLORS[ti % PIECE_COLORS.length] }]} />
            <Text style={[styles.legendText, t.id === highlightTeamId && styles.legendTextActive]}>
              {t.name} · {clamp(t.score)}/{target}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 360, alignSelf: 'center', marginBottom: 16 },
  board: { width: '100%', position: 'relative' },
  square: { position: 'absolute', borderRadius: 6, padding: 3 },
  squareBlue: { backgroundColor: '#D6E4EF' },
  squareYellow: { backgroundColor: '#F6E7B3' },
  squareStart: { backgroundColor: colors.ink },
  squareNum: { fontSize: 9, color: colors.inkSoft, fontFamily: fonts.bodySemiBold },
  squareNumLight: { color: colors.cream },
  piece: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: PIECE,
    height: PIECE,
    borderRadius: PIECE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  pieceActive: { borderColor: colors.gold },
  pieceText: { fontSize: 9, color: '#fff', fontFamily: fonts.bodySemiBold },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: colors.inkSoft, fontFamily: fonts.body },
  legendTextActive: { color: colors.ink, fontFamily: fonts.bodySemiBold },
});
