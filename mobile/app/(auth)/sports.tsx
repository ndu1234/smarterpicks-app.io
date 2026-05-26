import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { GoldButton } from '@/components/ui/GoldButton';
import { storage } from '@/lib/storage';

const SPORTS = [
  { key: 'NBA', label: 'NBA', subtitle: 'Basketball' },
  { key: 'NFL', label: 'NFL', subtitle: 'American Football' },
  { key: 'MLB', label: 'MLB', subtitle: 'Baseball' },
  { key: 'NHL', label: 'NHL', subtitle: 'Hockey' },
];

export default function SportPrefsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function toggle(sport: string) {
    setSelected((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  }

  async function handleContinue() {
    setLoading(true);
    const prefs = selected.length > 0 ? selected : SPORTS.map((s) => s.key);
    await storage.setSportPrefs(prefs);
    router.replace('/(tabs)');
  }

  async function handleSkip() {
    await storage.setSportPrefs(SPORTS.map((s) => s.key));
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>What sport would you like us to show you the most about on the picks?</Text>
        <Text style={styles.subtitle}>Select all that apply. You can change this later.</Text>

        <View style={styles.list}>
          {SPORTS.map((sport) => {
            const active = selected.includes(sport.key);
            return (
              <TouchableOpacity
                key={sport.key}
                style={[styles.row, active && styles.rowActive]}
                onPress={() => toggle(sport.key)}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.sportTag, active && styles.sportTagActive]}>
                    <Text style={[styles.sportTagText, active && styles.sportTagTextActive]}>
                      {sport.label}
                    </Text>
                  </View>
                  <Text style={styles.sportSubtitle}>{sport.subtitle}</Text>
                </View>
                <View style={[styles.check, active && styles.checkActive]}>
                  {active && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <GoldButton
          label={selected.length > 0 ? 'Continue →' : 'Show me everything →'}
          onPress={handleContinue}
          loading={loading}
        />
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
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  skipBtn: {
    padding: 8,
  },
  skipText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.textDim,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: Colors.text,
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textDim,
  },
  list: {
    gap: 10,
    marginTop: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
  },
  rowActive: {
    borderColor: Colors.accent,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sportTag: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 48,
    alignItems: 'center',
  },
  sportTagActive: {
    backgroundColor: Colors.accent,
  },
  sportTagText: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: Colors.textMuted,
  },
  sportTagTextActive: {
    color: Colors.bg,
  },
  sportSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.text,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkMark: {
    color: Colors.bg,
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
});
