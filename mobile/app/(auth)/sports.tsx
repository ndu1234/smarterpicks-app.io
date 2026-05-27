import { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius, TypeScale, Tracking } from '@/constants/theme';
import { PressableScale } from '@/components/ui/PressableScale';
import { storage } from '@/lib/storage';

const { width } = Dimensions.get('window');

const SPORTS = [
  { key: 'NBA', label: 'NBA', logo: '🏀' },
  { key: 'NFL', label: 'NFL', logo: '🏈' },
  { key: 'MLB', label: 'MLB', logo: '⚾' },
  { key: 'NHL', label: 'NHL', logo: '🏒' },
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
    if (loading) return;
    setLoading(true);
    const prefs = selected.length > 0 ? selected : SPORTS.map((s) => s.key);
    await storage.setSportPrefs(prefs);
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <PressableScale onPress={() => router.back()} scaleTo={0.9} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </PressableScale>
          <View style={styles.logoChip}>
            <Text style={styles.logoText}>SMARTERPICKS</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>What do you usually bet on?</Text>
          <Text style={styles.subtitle}>
            We'll prioritize predictions and insights for these sports.
          </Text>
        </View>

        {/* Sport rows */}
        <View style={styles.list}>
          {SPORTS.map((sport) => {
            const active = selected.includes(sport.key);
            return (
              <PressableScale
                key={sport.key}
                style={[styles.row, active && styles.rowActive]}
                onPress={() => toggle(sport.key)}
                scaleTo={0.975}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.rowLogo}>{sport.logo}</Text>
                  <Text style={styles.rowLabel}>{sport.label}</Text>
                </View>
                <View style={[styles.checkbox, active && styles.checkboxActive]}>
                  {active && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </PressableScale>
            );
          })}
        </View>

        <Text style={styles.hint}>You can change this anytime</Text>

        {/* Continue button */}
        <View style={styles.footer}>
          <PressableScale
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleContinue}
            scaleTo={0.97}
            disabled={loading}
          >
            <Text style={styles.buttonText}>CONTINUE</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: Colors.text,
  },
  logoChip: {
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  logoText: {
    fontFamily: Fonts.bodyBold,
    fontSize: TypeScale.labelLg,       // 11
    letterSpacing: Tracking.widest,    // 1.8
    color: Colors.accent,
  },
  titleBlock: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: 8,
  },
  title: {
    fontFamily: Fonts.bodyBold,
    fontSize: TypeScale.displayXl,     // 28
    color: Colors.text,
    lineHeight: 34,
    letterSpacing: Tracking.tight,     // -0.5
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: TypeScale.bodyMd,        // 14
    color: Colors.textMuted,
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: Spacing.md,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,           // 16px — outer card
    paddingVertical: 16,
    paddingHorizontal: Spacing.md,
  },
  rowActive: {
    borderColor: Colors.accent + '60',
    backgroundColor: Colors.bgElevated,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowLogo: {
    fontSize: 24,
  },
  rowLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: TypeScale.bodyLg,        // 16
    color: Colors.text,
    letterSpacing: Tracking.wide,      // 0.5
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,           // 4px — innermost element
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkmark: {
    color: Colors.bg,
    fontSize: TypeScale.bodySm,        // 13
    fontWeight: '700',
  },
  hint: {
    fontFamily: Fonts.body,
    fontSize: TypeScale.bodyXs,        // 12
    color: Colors.textDim,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,           // 8px — button inside screen
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: Fonts.bodyBold,
    fontSize: TypeScale.bodySm,        // 13
    letterSpacing: Tracking.wider,     // 1.2
    color: Colors.bg,
  },
});
