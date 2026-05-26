import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { PickCard } from '@/components/picks/PickCard';
import { EmptyPickState } from '@/components/picks/EmptyPickState';
import { useTodaysPicks, useSportPrefs } from '@/hooks/usePicks';
import type { Pick } from '@/constants/types';

const ALL_SPORTS = ['NBA', 'NFL', 'MLB', 'NHL'];

function SectionLabel({ text, dim }: { text: string; dim?: boolean }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={[styles.sectionLabel, dim && styles.sectionLabelDim]}>{text}</Text>
      <View style={[styles.sectionLine, dim && styles.sectionLineDim]} />
    </View>
  );
}

export default function TodaysPicksScreen() {
  const { data, isLoading, refetch, isRefetching } = useTodaysPicks();
  const { data: rawPrefs } = useSportPrefs();
  const today = format(new Date(), 'EEEE, MMMM d').toUpperCase();

  const allPicks: Pick[] = data?.picks ?? [];

  // Determine preferred sports — if all 4 saved (or null), treat as no preference
  const prefs: string[] = rawPrefs ?? ALL_SPORTS;
  const hasSpecificPrefs =
    rawPrefs !== null &&
    rawPrefs !== undefined &&
    rawPrefs.length < ALL_SPORTS.length;

  const yourPicks = hasSpecificPrefs
    ? allPicks.filter((p) => prefs.includes(p.sport))
    : allPicks;
  const otherPicks = hasSpecificPrefs
    ? allPicks.filter((p) => !prefs.includes(p.sport))
    : [];

  const haspicks = allPicks.length > 0;

  // Build flat list items with section headers
  type ListItem =
    | { type: 'header'; text: string; dim?: boolean }
    | { type: 'pick'; pick: Pick };

  const listData: ListItem[] = [];

  if (hasSpecificPrefs && yourPicks.length > 0) {
    listData.push({ type: 'header', text: 'YOUR SPORTS' });
    yourPicks.forEach((p) => listData.push({ type: 'pick', pick: p }));
  } else {
    allPicks.forEach((p) => listData.push({ type: 'pick', pick: p }));
  }

  if (otherPicks.length > 0) {
    listData.push({ type: 'header', text: 'OTHER PICKS', dim: true });
    otherPicks.forEach((p) => listData.push({ type: 'pick', pick: p }));
  }

  const headerSubtitle = hasSpecificPrefs && haspicks
    ? `${yourPicks.length} of your picks${otherPicks.length > 0 ? ` · ${otherPicks.length} others` : ''}`
    : haspicks
    ? `${allPicks.length} plays`
    : null;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.liveRow}>
          <View style={[styles.dot, haspicks && styles.dotLive]} />
          <Text style={styles.liveLabel}>
            {haspicks ? "TODAY'S SLATE IS LIVE" : "PICKS DROP AT 9AM ET"}
          </Text>
        </View>
        <Text style={styles.date}>{today}</Text>
        {headerSubtitle && (
          <Text style={styles.pickCount}>{headerSubtitle}</Text>
        )}
      </View>

      <View style={styles.accentLine} />

      <FlatList
        data={listData}
        keyExtractor={(item, i) =>
          item.type === 'header' ? `header-${i}` : item.pick.id
        }
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return <SectionLabel text={item.text} dim={item.dim} />;
          }
          return (
            <View style={{ opacity: hasSpecificPrefs && otherPicks.includes(item.pick) ? 0.55 : 1 }}>
              <PickCard pick={item.pick} />
            </View>
          );
        }}
        contentContainerStyle={[styles.list, !haspicks && styles.listEmpty]}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={isLoading ? null : <EmptyPickState />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.accent}
          />
        }
      />
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
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textDim,
  },
  dotLive: {
    backgroundColor: Colors.win,
  },
  liveLabel: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.textMuted,
  },
  date: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: Colors.text,
    lineHeight: 34,
  },
  pickCount: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
  },
  accentLine: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  list: {
    padding: Spacing.md,
  },
  listEmpty: {
    flex: 1,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs ?? 4,
  },
  sectionLabel: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: Colors.accent,
  },
  sectionLabelDim: {
    color: Colors.textDim,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.accent + '40',
  },
  sectionLineDim: {
    backgroundColor: Colors.border,
  },
});
