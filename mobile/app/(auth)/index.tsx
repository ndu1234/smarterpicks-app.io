import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { GoldButton } from '@/components/ui/GoldButton';
import { WhopAuthModal } from '@/components/auth/WhopAuthModal';
import { storage } from '@/lib/storage';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { buildWhopAuthUrl, exchangeCodeForToken } from '@/lib/whop';

const { width, height } = Dimensions.get('window');

// Diamond positions scattered around the screen
const DIAMONDS = [
  { top: 0.06, left: 0.08,  size: 8,  duration: 2200, delay: 0 },
  { top: 0.12, left: 0.75,  size: 5,  duration: 2800, delay: 400 },
  { top: 0.18, left: 0.45,  size: 10, duration: 2000, delay: 200 },
  { top: 0.24, left: 0.88,  size: 6,  duration: 3000, delay: 800 },
  { top: 0.30, left: 0.05,  size: 7,  duration: 2400, delay: 600 },
  { top: 0.38, left: 0.62,  size: 4,  duration: 2600, delay: 300 },
  { top: 0.48, left: 0.92,  size: 9,  duration: 1900, delay: 700 },
  { top: 0.52, left: 0.02,  size: 5,  duration: 2700, delay: 100 },
  { top: 0.60, left: 0.80,  size: 7,  duration: 2300, delay: 500 },
  { top: 0.66, left: 0.18,  size: 6,  duration: 2500, delay: 900 },
  { top: 0.74, left: 0.55,  size: 8,  duration: 2100, delay: 200 },
  { top: 0.80, left: 0.90,  size: 4,  duration: 2900, delay: 650 },
  { top: 0.86, left: 0.30,  size: 6,  duration: 2200, delay: 350 },
  { top: 0.10, left: 0.30,  size: 5,  duration: 3100, delay: 750 },
  { top: 0.44, left: 0.40,  size: 4,  duration: 2400, delay: 450 },
];

function GlowDiamond({
  top, left, size, duration, delay,
}: {
  top: number; left: number; size: number; duration: number; delay: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.7,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.05,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.5,
            duration,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        top: top * height,
        left: left * width,
        fontSize: size,
        color: Colors.accent,
        opacity,
        transform: [{ scale }],
        // Glow effect via shadow
        textShadowColor: Colors.accent,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: size * 2,
      }}
    >
      ◆
    </Animated.Text>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { setMember, setLoading } = useAuthStore();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const codeVerifierRef = useRef<string | null>(null);
  const stateRef = useRef<string | null>(null);

  // Pulsing main diamond
  const mainPulse = useRef(new Animated.Value(1)).current;
  const mainGlow = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(mainPulse, { toValue: 1.15, duration: 1400, useNativeDriver: true }),
          Animated.timing(mainGlow, { toValue: 1, duration: 1400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(mainPulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
          Animated.timing(mainGlow, { toValue: 0.6, duration: 1400, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  async function handleLoginPress() {
    try {
      setButtonLoading(true);
      const { url, codeVerifier: verifier, state } = await buildWhopAuthUrl();
      codeVerifierRef.current = verifier;
      stateRef.current = state;
      setAuthUrl(url);
      setShowModal(true);
    } catch {
      Alert.alert('Error', 'Could not open sign-in. Please try again.');
    } finally {
      setButtonLoading(false);
    }
  }

  async function handleCode(code: string) {
    setShowModal(false);
    setProcessing(true);
    const verifier = codeVerifierRef.current;
    try {
      setLoading(true);
      const tokenData = await exchangeCodeForToken(code, verifier!);
      await storage.setAccessToken(tokenData.access_token);
      if (tokenData.refresh_token) await storage.setRefreshToken(tokenData.refresh_token);
      const me = await api.auth.me();
      await storage.setMember(me);
      setMember(me);
      const seen = await storage.getOnboardingSeen();
      if (!seen) {
        router.replace('/(auth)/onboarding');
      } else {
        const prefs = await storage.getSportPrefs();
        router.replace(prefs ? '/(tabs)' : '/(auth)/sports');
      }
    } catch {
      setProcessing(false);
      setLoading(false);
      Alert.alert(
        'Sign In Failed',
        'Something went wrong. Please try again.',
        [{ text: 'Try Again', onPress: handleLoginPress }]
      );
    }
  }

  if (processing) {
    return (
      <View style={styles.processingScreen}>
        <Animated.Text
          style={[styles.mainDiamond, { transform: [{ scale: mainPulse }], opacity: mainGlow,
            textShadowColor: Colors.accent, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 24 }]}
        >
          ◆
        </Animated.Text>
        <ActivityIndicator color={Colors.accent} size="large" style={{ marginTop: 24 }} />
        <Text style={styles.processingText}>Signing you in…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Floating glowing diamonds */}
      {DIAMONDS.map((d, i) => (
        <GlowDiamond key={i} {...d} />
      ))}

      {/* Subtle radial glow behind hero */}
      <View style={styles.centerGlow} pointerEvents="none" />

      {/* Gold top bar */}
      <View style={styles.topBar} />

      {/* Hero */}
      <View style={styles.hero}>
        <Animated.Text
          style={[
            styles.mainDiamond,
            {
              transform: [{ scale: mainPulse }],
              opacity: mainGlow,
              textShadowColor: Colors.accent,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 28,
            },
          ]}
        >
          ◆
        </Animated.Text>
        <Text style={styles.wordmark}>SMARTERPICKS</Text>
        <Text style={styles.tagline}>
          Stop guessing.{'\n'}
          <Text style={styles.taglineItalic}>Start winning.</Text>
        </Text>
      </View>

      {/* Stats */}
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

      {/* CTA */}
      <View style={styles.actions}>
        <GoldButton
          label="Sign in with Whop →"
          onPress={handleLoginPress}
          loading={buttonLoading}
        />
        <Text style={styles.legal}>
          Members only. Start your 7-day free trial at smarterpicks.io
        </Text>
      </View>

      {/* Ticker */}
      <View style={styles.ticker}>
        <Text style={styles.tickerText}>
          AI-POWERED · DAILY PICKS · TRANSPARENT ARCHIVE · ALL MAJOR SPORTS
        </Text>
      </View>

      {showModal && authUrl && stateRef.current && (
        <WhopAuthModal
          authUrl={authUrl}
          expectedState={stateRef.current}
          onCode={handleCode}
          onCancel={() => setShowModal(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  processingScreen: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.textDim,
    marginTop: 16,
    letterSpacing: 0.5,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'space-between',
  },
  centerGlow: {
    position: 'absolute',
    top: height * 0.2,
    left: width * 0.15,
    width: width * 0.7,
    height: height * 0.35,
    borderRadius: 999,
    backgroundColor: Colors.accent,
    opacity: 0.05,
  },
  topBar: {
    height: 3,
    backgroundColor: Colors.accent,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  mainDiamond: {
    fontSize: 44,
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
