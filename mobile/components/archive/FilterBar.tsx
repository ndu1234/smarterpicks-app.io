import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { Sport } from '@/constants/types';

const SPORTS: Array<Sport | 'ALL'> = ['ALL', 'NBA', 'NFL', 'MLB', 'NHL'];

interface Props {
  selected: Sport | 'ALL';
  onSelect: (sport: Sport | 'ALL') => void;
}

export function FilterBar({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {SPORTS.map((sport) => {
        const active = selected === sport;
        return (
          <TouchableOpacity
            key={sport}
            onPress={() => onSelect(sport)}
            style={[styles.tab, active && styles.tabActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{sport}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 8,
  },
  tab: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.bgSurface,
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.textMuted,
  },
  labelActive: {
    color: Colors.accent,
  },
});
