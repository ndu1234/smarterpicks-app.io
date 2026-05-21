import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';
import type { PickResult } from '@/constants/types';

const CONFIG: Record<PickResult, { label: string; color: string; bg: string }> = {
  win:     { label: 'WIN',     color: Colors.win,      bg: '#1a2e1d' },
  loss:    { label: 'LOSS',    color: Colors.loss,     bg: '#2e1a1a' },
  push:    { label: 'PUSH',    color: Colors.push,     bg: '#222222' },
  pending: { label: 'LIVE',    color: Colors.accent,   bg: '#2a2212' },
};

export function ResultBadge({ result }: { result: PickResult }) {
  const c = CONFIG[result];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.color }]}>
      <Text style={[styles.label, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  label: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
  },
});
