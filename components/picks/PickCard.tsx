import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/constants/theme';
import { SportBadge } from '@/components/ui/SportBadge';
import { ConfidenceBar } from '@/components/ui/ConfidenceBar';
import { ResultBadge } from '@/components/ui/ResultBadge';
import type { Pick } from '@/constants/types';

interface Props {
  pick: Pick;
  showResult?: boolean;
}

export function PickCard({ pick, showResult = false }: Props) {
  const unitsLabel = pick.units === 1 ? '1u' : `${pick.units}u`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SportBadge sport={pick.sport} />
          <Text style={styles.matchup}>
            {pick.awayTeam} @ {pick.homeTeam}
          </Text>
        </View>
        {showResult ? (
          <ResultBadge result={pick.result} />
        ) : (
          <View style={styles.unitsTag}>
            <Text style={styles.unitsText}>{unitsLabel}</Text>
          </View>
        )}
      </View>

      <View style={styles.betRow}>
        <Text style={styles.betDescription}>{pick.betDescription}</Text>
        <Text style={styles.odds}>{pick.odds}</Text>
      </View>

      <View style={styles.divider} />

      <ConfidenceBar value={pick.confidence} />

      <Text style={styles.reasoning}>{pick.reasoning}</Text>

      {showResult && pick.resultDescription && (
        <Text style={styles.resultDesc}>{pick.resultDescription}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  matchup: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
  },
  unitsTag: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  unitsText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.textMuted,
  },
  betRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  betDescription: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 17,
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  odds: {
    fontFamily: Fonts.mono,
    fontSize: 15,
    color: Colors.accent,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  reasoning: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  resultDesc: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textDim,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
