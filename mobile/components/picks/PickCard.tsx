import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/constants/theme';
import { ResultBadge } from '@/components/ui/ResultBadge';
import type { Pick } from '@/constants/types';

const SPORT_COLORS: Record<string, string> = {
  NBA: '#C9082A',
  NFL: '#013369',
  MLB: '#041E42',
  NHL: '#000000',
};

interface Props {
  pick: Pick;
  showResult?: boolean;
}

export function PickCard({ pick, showResult = false }: Props) {
  const sportColor = SPORT_COLORS[pick.sport] || Colors.accent;
  const unitsLabel = `${pick.units}u`;

  // Shorten reasoning to first sentence only
  const shortReason = pick.reasoning?.split('.')[0] + '.';

  return (
    <View style={styles.card}>

      {/* Top row: sport + game time + units */}
      <View style={styles.topRow}>
        <View style={[styles.sportBadge, { backgroundColor: sportColor }]}>
          <Text style={styles.sportText}>{pick.sport}</Text>
        </View>
        {pick.gameTime && (
          <Text style={styles.gameTime}>{pick.gameTime}</Text>
        )}
        <View style={styles.spacer} />
        {showResult ? (
          <ResultBadge result={pick.result} />
        ) : (
          <View style={styles.unitsBadge}>
            <Text style={styles.unitsText}>{unitsLabel}</Text>
          </View>
        )}
      </View>

      {/* The pick — biggest element */}
      <View style={styles.pickRow}>
        <Text style={styles.pickText} numberOfLines={2}>{pick.betDescription}</Text>
        <Text style={styles.oddsText}>{pick.odds}</Text>
      </View>

      {/* Matchup */}
      <Text style={styles.matchup}>
        {pick.awayTeam} @ {pick.homeTeam}
      </Text>

      {/* Book */}
      {pick.book && (
        <View style={styles.bookRow}>
          <Text style={styles.bookLabel}>BET AT</Text>
          <Text style={styles.bookName}>{pick.book}</Text>
        </View>
      )}

      <View style={styles.divider} />

      {/* Short reasoning */}
      <Text style={styles.reason} numberOfLines={2}>{shortReason}</Text>

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
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sportBadge: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  sportText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: '#fff',
    letterSpacing: 1,
  },
  gameTime: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.textDim,
    letterSpacing: 0.5,
  },
  spacer: {
    flex: 1,
  },
  unitsBadge: {
    backgroundColor: Colors.accent + '22',
    borderWidth: 1,
    borderColor: Colors.accent + '55',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  unitsText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.accent,
    fontWeight: '600',
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pickText: {
    fontFamily: Fonts.display,
    fontSize: 22,
    color: Colors.text,
    flex: 1,
    lineHeight: 28,
  },
  oddsText: {
    fontFamily: Fonts.mono,
    fontSize: 20,
    color: Colors.accent,
    fontWeight: '700',
  },
  matchup: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textDim,
    marginTop: -4,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookLabel: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    color: Colors.textDim,
    letterSpacing: 1,
  },
  bookName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  reason: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
});
