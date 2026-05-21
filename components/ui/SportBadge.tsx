import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';
import type { Sport } from '@/constants/types';

export function SportBadge({ sport }: { sport: Sport }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.label}>{sport}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderColor: Colors.accentDim,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  label: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.accent,
  },
});
