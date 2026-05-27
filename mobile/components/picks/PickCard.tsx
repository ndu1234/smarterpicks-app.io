import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing, Radius, TypeScale, Tracking, Elevation, SportColors } from '@/constants/theme';
import { ResultBadge } from '@/components/ui/ResultBadge';
import { PressableScale } from '@/components/ui/PressableScale';
import type { Pick } from '@/constants/types';

interface Props {
  pick: Pick;
  showResult?: boolean;
  onPress?: () => void;
}

export function PickCard({ pick, showResult = false, onPress }: Props) {
  const sportColor = SportColors[pick.sport] || Colors.accent;
  const unitsLabel = `${pick.units}u`;
  const shortReason = pick.reasoning
    ? pick.reasoning.split('.')[0] + '.'
    : null;

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.982}
      disabled={!onPress}
      style={[styles.card, !onPress && { transform: [{ scale: 1 }] }]}
    >
      {/* ── Top row: sport badge · game time · units/result ── */}
      <View style={styles.topRow}>
        {/* Sport badge — innermost element: Radius.sm (4px) */}
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
          // Units badge — Radius.sm inside card (Radius.xl)
          <View style={styles.unitsBadge}>
            <Text style={styles.unitsText}>{unitsLabel}</Text>
          </View>
        )}
      </View>

      {/* ── Pick: left-aligned description + right-aligned odds ── */}
      <View style={styles.pickRow}>
        <Text style={styles.pickText} numberOfLines={2}>
          {pick.betDescription}
        </Text>
        {/* Odds: tabular nums + tight tracking so digits never jitter */}
        <Text style={styles.oddsText}>{pick.odds}</Text>
      </View>

      {/* Matchup — double-jump from pick: smaller size + muted color */}
      <Text style={styles.matchup} numberOfLines={1}>
        {pick.awayTeam} @ {pick.homeTeam}
      </Text>

      {/* Book — right-aligned data, left-aligned label */}
      {pick.book && (
        <View style={styles.bookRow}>
          <Text style={styles.bookLabel}>BET AT</Text>
          <View style={styles.spacer} />
          <Text style={styles.bookName}>{pick.book}</Text>
        </View>
      )}

      <View style={styles.divider} />

      {/* Reasoning — lowest hierarchy: smallest size, most muted color */}
      {shortReason && (
        <Text style={styles.reason} numberOfLines={2}>
          {shortReason}
        </Text>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,        // outer card: 16px
    padding: Spacing.md,
    gap: 10,
    // Physical depth — card lifts off the dark background
    ...Elevation.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sportBadge: {
    borderRadius: Radius.sm,        // innermost: 4px — proportional to card's 16px
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  sportText: {
    fontFamily: Fonts.mono,
    fontSize: TypeScale.labelMd,    // 10
    color: '#fff',
    letterSpacing: Tracking.widest, // 1.8 — tight mono badge label
  },
  gameTime: {
    fontFamily: Fonts.mono,
    fontSize: TypeScale.labelMd,    // 10
    color: Colors.textDim,
    letterSpacing: Tracking.wide,   // 0.5
  },
  spacer: {
    flex: 1,
  },
  unitsBadge: {
    backgroundColor: Colors.accent + '22',
    borderWidth: 1,
    borderColor: Colors.accent + '55',
    borderRadius: Radius.sm,        // 4px — innermost
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  unitsText: {
    fontFamily: Fonts.mono,
    fontSize: TypeScale.labelLg,    // 11
    color: Colors.accent,
    letterSpacing: Tracking.wide,   // 0.5
    // tabular nums: every digit same width so "1u" and "9u" never shift layout
    fontVariant: ['tabular-nums'],
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pickText: {
    fontFamily: Fonts.display,
    fontSize: TypeScale.displayLg,  // 22 — display hierarchy, left-aligned
    color: Colors.text,
    flex: 1,
    lineHeight: 28,
    letterSpacing: Tracking.tight,  // -0.5 — tighten display text
  },
  oddsText: {
    fontFamily: Fonts.mono,
    fontSize: TypeScale.displayLg,  // 22 — matches pick size, right-aligned
    color: Colors.accent,
    fontWeight: '700',
    letterSpacing: Tracking.tighter, // -0.8 — aggressive tighten on financial numbers
    fontVariant: ['tabular-nums'],   // tabular: odds never jitter on live updates
  },
  matchup: {
    fontFamily: Fonts.body,
    fontSize: TypeScale.bodyXs,     // 12 — double-jump: smaller size + muted color
    color: Colors.textDim,
    marginTop: -4,
    letterSpacing: Tracking.normal,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookLabel: {
    fontFamily: Fonts.mono,
    fontSize: TypeScale.labelSm,    // 9 — furthest from primary hierarchy
    color: Colors.textDim,
    letterSpacing: Tracking.widest, // 1.8 — uppercase label needs wide tracking
  },
  bookName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: TypeScale.bodyXs,     // 12 — right-aligned financial label
    color: Colors.textMuted,
    letterSpacing: Tracking.tight,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  reason: {
    fontFamily: Fonts.body,
    fontSize: TypeScale.bodyXs,     // 12 — lowest hierarchy
    color: Colors.textMuted,
    lineHeight: 18,
    letterSpacing: Tracking.normal,
  },
});
