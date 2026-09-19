import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  totalSeconds: number;
  timeRemaining: number;
  size?: number;
}

export default function CountdownRing({ totalSeconds, timeRemaining, size = 184 }: Props) {
  const progress = useRef(new Animated.Value(1)).current;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: timeRemaining / totalSeconds,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [timeRemaining, totalSeconds]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const isLow = timeRemaining <= 5;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#5A3A26" strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isLow ? '#FF6B4D' : colors.gold}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={[styles.timeText, isLow && styles.timeTextLow]}>{timeRemaining}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  timeText: { fontFamily: fonts.display, fontSize: 46, color: colors.cream },
  timeTextLow: { color: '#FF6B4D' },
});
