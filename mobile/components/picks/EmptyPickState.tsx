import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { useEffect, useState } from 'react';

function getCountdown() {
  const now = new Date();
  const target = new Date();
  target.setUTCHours(13, 0, 0, 0); // 9 AM ET = 13:00 UTC
  if (now >= target) target.setUTCDate(target.getUTCDate() + 1);
  const diff = target.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function EmptyPickState() {
  const [countdown, setCountdown] = useState(getCountdown());

  useEffect(() => {
    const id = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.diamond}>◆</Text>
      <Text style={styles.title}>Picks drop at 9AM ET</Text>
      <Text style={styles.subtitle}>Next card in</Text>
      <Text style={styles.countdown}>{countdown}</Text>
      <Text style={styles.note}>You'll get a notification the moment they're live.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xxl,
  },
  diamond: {
    fontSize: 32,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.bodyBold,
    fontSize: 18,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  countdown: {
    fontFamily: Fonts.mono,
    fontSize: 36,
    color: Colors.accent,
    letterSpacing: 2,
  },
  note: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textDim,
    textAlign: 'center',
    marginTop: Spacing.sm,
    maxWidth: 240,
    lineHeight: 18,
  },
});
