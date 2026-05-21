import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { Sport } from '@/constants/types';

const SPORTS: Array<Sport | 'ALL'> = ['ALL', 'NBA', 'NFL', 'MLB', 'NHL'];

interface Props {
  selected: Sport | 'ALL';
  onSelect: (sport: Sport | 'ALL') => void;
}

export function FilterBar({ selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {SPORTS.map((sport) => {
        const active = selected === sport;
        return (
          <TouchableOpacity
            key={sport}
            onPress={() => onSelect(sport)}
            style={[styles.pill, active && styles.pillActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{sport}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  pill: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.bgSurface,
  },
  label: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.textMuted,
  },
  labelActive: {
    color: Colors.accent,
  },
});
