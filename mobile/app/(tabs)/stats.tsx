import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius } from '@/constants/theme';
import { useStats } from '@/hooks/usePicks';
import type { SportStat } from '@/constants/types';

function RecordDisplay({ wins, losses, pushes }: { wins: number; losses: number; pushes: number }) {
  return (
    <View style={styles.recordRow}>
      <View style={styles.recordItem}>
        <Text style={[styles.recordNum, { color: Colors.win }]}>{wins}</Text>
        <Text style={styles.recordLabel}>WINS</Text>
      </View>
      <Text style={styles.recordDash}>–</Text>
      <View style={styles.recordItem}>
        <Text style={[styles.recordNum, { color: Colors.loss }]}>{losses}</Text>
        <Text style={styles.recordLabel}>LOSSES</Text>
      </View>
      {pushes > 0 && (
        <>
          <Text style={styles.recordDash}>–</Text>
          <View style={styles.recordItem}>
            <Text style={[styles.recordNum, { color: Colors.push }]}>{pushes}</Text>
            <Text style={styles.recordLabel}>PUSH</Text>
          </View>
        </>
      )}
    </View>
  );
}

function StatCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
  );
}

function SportRow({ stat }: { stat: SportStat }) {
  const record = `${stat.wins}–${stat.losses}${stat.pushes > 0 ? `–${stat.pushes}` : ''}`;
  const roiColor = stat.roi >= 0 ? Colors.win : Colors.loss;
  return (
    <View style={styles.sportRow}>
      <View style={styles.sportBadgeSmall}>
        <Text style={styles.sportBadgeText}>{stat.sport}</Text>
      </View>
      <Text style={styles.sportRecord}>{record}</Text>
      <Text style={[styles.sportRoi, { color: roiColor }]}>
        {stat.roi >= 0 ? '+' : ''}{stat.roi.toFixed(1)}% ROI
      </Text>
      <Text style={styles.sportUnits}>
        {stat.unitsProfit >= 0 ? '+' : ''}{stat.unitsProfit.toFixed(1)}u
      </Text>
    </View>
  );
}

export default function StatsScreen() {
  const { data, isLoading } = useStats();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!data) return null;

  const roiColor = data.roi >= 0 ? Colors.win : Colors.loss;
  const profitColor = data.dollarProfit >= 0 ? Colors.win : Colors.loss;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Stats</Text>
          <Text style={styles.subtitle}>All picks — publicly logged</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>OVERALL RECORD</Text>
          <RecordDisplay wins={data.wins} losses={data.losses} pushes={data.pushes} />
        </View>

        <View style={styles.divider} />

        <View style={styles.cards}>
          <StatCard
            value={`${data.roi >= 0 ? '+' : ''}${data.roi.toFixed(1)}%`}
            label="ROI"
            sub="Return on investment"
          />
          <StatCard
            value={`${data.unitsProfit >= 0 ? '+' : ''}${data.unitsProfit.toFixed(1)}u`}
            label="Units Profit"
            sub="All-time"
          />
          <StatCard
            value={`${data.dollarProfit >= 0 ? '+$' : '-$'}${Math.abs(data.dollarProfit).toLocaleString()}`}
            label="$ Profit"
            sub="$100 per unit"
          />
          <StatCard
            value={String(data.totalPicks)}
            label="Total Picks"
            sub="Publicly logged"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BY SPORT</Text>
          {data.sportBreakdown.map((s) => (
            <SportRow key={s.sport} stat={s} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  header: {
    gap: 4,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
  },
  section: {
    gap: Spacing.md,
  },
  sectionLabel: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.textDim,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  recordItem: {
    alignItems: 'center',
    gap: 2,
  },
  recordNum: {
    fontFamily: Fonts.display,
    fontSize: 52,
    lineHeight: 58,
  },
  recordLabel: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: Colors.textDim,
  },
  recordDash: {
    fontFamily: Fonts.display,
    fontSize: 36,
    color: Colors.border,
  },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 2,
  },
  statValue: {
    fontFamily: Fonts.display,
    fontSize: 26,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.textMuted,
  },
  statSub: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textDim,
  },
  sportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  sportBadgeSmall: {
    borderWidth: 1,
    borderColor: Colors.accentDim,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    width: 40,
    alignItems: 'center',
  },
  sportBadgeText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: Colors.accent,
  },
  sportRecord: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    color: Colors.text,
    flex: 1,
  },
  sportRoi: {
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
  sportUnits: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: Colors.textMuted,
    width: 48,
    textAlign: 'right',
  },
});
