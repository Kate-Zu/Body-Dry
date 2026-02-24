import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../constants/colors';

export const ProgressRing = ({
  progress = 0,
  size = 120,
  strokeWidth = 12,
  color = Colors.primary,
  bgColor = 'rgba(187, 224, 255, 0.1)',
  centerValue,
  centerLabel,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          stroke={bgColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        {centerValue !== undefined && (
          <Text style={styles.centerValue}>{centerValue}</Text>
        )}
        {centerLabel && <Text style={styles.centerLabel}>{centerLabel}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  centerValue: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.white,
  },
  centerLabel: {
    fontSize: 10,
    color: Colors.white,
    letterSpacing: 0.4,
  },
});
