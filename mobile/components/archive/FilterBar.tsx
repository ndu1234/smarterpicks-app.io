import { Text, StyleSheet, View } from 'react-native';
import { PressableScale } from '@/components/ui/PressableScale';
import { Colors, Fonts, Spacing, Radius, TypeScale, Tracking } from '@/constants/theme';
import type { Sport } from '@/constants/types';

const SPORTS: Array<Sport | 'ALL'> = ['ALL', 'NBA', 'NFL', 'MLB', 'NHL'];

interface Props {
  selected: Sport | 'ALL';
  onSelect: (sport: Sport | 'ALL') => void;
}

export function FilterBar({ selected, onSelect }: Props) {
  return (
    <View style={styles.sidebar}>
      {SPORTS.map((sport) => {
        const active = selected === sport;
        return (
          <PressableScale
            key={sport}
            onPress={() => onSelect(sport)}
            scaleTo={0.92}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {sport}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 64,
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.sm,
    gap: 8,
  },
  tab: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,      // 8px — inside archive screen container
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.bgSurface,
  },
  label: {
    fontFamily: Fonts.bodyBold,
    fontSize: TypeScale.labelMd,  // 10
    color: Colors.textMuted,
    letterSpacing: Tracking.wide, // 0.5
  },
  labelActive: {
    color: Colors.accent,
    letterSpacing: Tracking.wide,
  },
});
