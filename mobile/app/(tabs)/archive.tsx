import { useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { PickCard } from '@/components/picks/PickCard';
import { FilterBar } from '@/components/archive/FilterBar';
import { useArchive } from '@/hooks/usePicks';
import type { Sport, Pick } from '@/constants/types';

function SectionHeader({ date }: { date: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionDate}>
        {format(parseISO(date), 'EEEE, MMMM d').toUpperCase()}
      </Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

function groupByDate(picks: Pick[]) {
  const map = new Map<string, Pick[]>();
  for (const p of picks) {
    const d = p.date;
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(p);
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

export default function ArchiveScreen() {
  const [sport, setSport] = useState<Sport | 'ALL'>('ALL');
  const { data, isLoading } = useArchive(sport === 'ALL' ? undefined : sport);

  const picks = data?.picks ?? [];
  const grouped = groupByDate(picks);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Archive</Text>
        <Text style={styles.subtitle}>{data?.total ?? 0} picks publicly logged</Text>
      </View>

      <View style={styles.body}>
        <FilterBar selected={sport} onSelect={setSport} />

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Colors.accent} />
          </View>
        ) : (
          <FlatList
            data={grouped}
            keyExtractor={(g) => g.date}
            renderItem={({ item: group }) => (
              <View style={styles.group}>
                <SectionHeader date={group.date} />
                {group.items.map((pick) => (
                  <View key={pick.id} style={{ marginBottom: Spacing.sm }}>
                    <PickCard pick={pick} showResult />
                  </View>
                ))}
              </View>
            )}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
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
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: Spacing.sm,
  },
  group: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionDate: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.textDim,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
});
