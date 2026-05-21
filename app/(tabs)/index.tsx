import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { PickCard } from '@/components/picks/PickCard';
import { EmptyPickState } from '@/components/picks/EmptyPickState';
import { useTodaysPicks } from '@/hooks/usePicks';

export default function TodaysPicksScreen() {
  const { data, isLoading, refetch, isRefetching } = useTodaysPicks();
  const today = format(new Date(), 'EEEE, MMMM d').toUpperCase();
  const picks = data?.picks ?? [];
  const haspicks = picks.length > 0;

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
        {haspicks && (
          <Text style={styles.pickCount}>{picks.length} plays</Text>
        )}
      </View>

      <View style={styles.accentLine} />

      <FlatList
        data={picks}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <PickCard pick={item} />}
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
});
