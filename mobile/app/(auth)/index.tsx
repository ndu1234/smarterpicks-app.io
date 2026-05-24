import { useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { GoldButton } from '@/components/ui/GoldButton';
import { WhopAuthModal } from '@/components/auth/WhopAuthModal';
import { storage } from '@/lib/storage';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { buildWhopAuthUrl, exchangeCodeForToken } from '@/lib/whop';

const API_BASE = process.env.EXPO_PUBLIC_API_URL!;

export default function LoginScreen() {
  const router = useRouter();
  const { setMember, setLoading } = useAuthStore();
  const [loading, setLocalLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const codeVerifierRef = useRef<string | null>(null);

  async function handleLoginPress() {
    try {
      setLocalLoading(true);
      const { url, codeVerifier: verifier } = await buildWhopAuthUrl();
      codeVerifierRef.current = verifier;
      setAuthUrl(url);
      setShowModal(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLocalLoading(false);
    }
  }

  async function handleCode(code: string) {
    setShowModal(false);
    const verifier = codeVerifierRef.current;
    try {
      setLoading(true);
      const tokenData = await exchangeCodeForToken(code, verifier!);
      await storage.setAccessToken(tokenData.access_token);
      if (tokenData.refresh_token) await storage.setRefreshToken(tokenData.refresh_token);
      const me = await api.auth.me();
      setMember(me);
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Token exchange failed:', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar} />

      <View style={styles.hero}>
        <Text style={styles.diamond}>◆</Text>
        <Text style={styles.wordmark}>SMARTERPICKS</Text>
        <Text style={styles.tagline}>
          Stop guessing.{'\n'}
          <Text style={styles.taglineItalic}>Start winning.</Text>
        </Text>
      </View>

      <View style={styles.stats}>
        {[
          { value: '+$3,840', label: '$100 BETTOR PROFIT · YTD' },
          { value: '9.3%', label: 'ROI' },
          { value: '4.1k', label: 'ACTIVE MEMBERS' },
        ].map((s) => (
          <View key={s.label} style={styles.statItem}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <GoldButton
          label="Sign in with Whop →"
          onPress={handleLoginPress}
          loading={loading}
        />
        <Text style={styles.legal}>
          Members only. Start your 7-day free trial at smarterpicks.io
        </Text>
      </View>

      <View style={styles.ticker}>
        <Text style={styles.tickerText}>
          AI-POWERED · DAILY PICKS · TRANSPARENT ARCHIVE · ALL MAJOR SPORTS
        </Text>
      </View>

      {showModal && authUrl && (
        <WhopAuthModal
          authUrl={authUrl}
          onCode={handleCode}
          onCancel={() => setShowModal(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'space-between',
  },
  topBar: {
    height: 4,
    backgroundColor: Colors.accent,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  diamond: {
    fontSize: 40,
    color: Colors.accent,
  },
  wordmark: {
    fontFamily: Fonts.bodyBold,
    fontSize: 22,
    letterSpacing: 4,
    color: Colors.text,
  },
  tagline: {
    fontFamily: Fonts.display,
    fontSize: 38,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 46,
    marginTop: Spacing.sm,
  },
  taglineItalic: {
    fontFamily: Fonts.displayItalic,
    color: Colors.accent,
    fontStyle: 'italic',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: Fonts.display,
    fontSize: 22,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    color: Colors.textDim,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  legal: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textDim,
    textAlign: 'center',
    lineHeight: 16,
  },
  ticker: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  tickerText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.bg,
  },
});
