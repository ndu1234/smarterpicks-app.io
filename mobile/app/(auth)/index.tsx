import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  Alert, Animated, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { GoldButton } from '@/components/ui/GoldButton';
import { WhopAuthModal } from '@/components/auth/WhopAuthModal';
import { storage } from '@/lib/storage';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { buildWhopAuthUrl, exchangeCodeForToken } from '@/lib/whop';

const { width, height } = Dimensions.get('window');

// Each floating diamond drifts between two random points
const DIAMONDS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  startX: Math.random() * width,
  startY: Math.random() * height,
  endX: Math.random() * width,
  endY: Math.random() * height,
  size: 6 + Math.random() * 8,
  duration: 4000 + Math.random() * 5000,
  delay: Math.random() * 3000,
  opacity: 0.15 + Math.random() * 0.45,
}));

function FloatingDiamond({
  startX, startY, endX, endY,
  size, duration, delay, opacity: maxOpacity,
}: typeof DIAMONDS[0]) {
  const x = useRef(new Animated.Value(startX)).current;
  const y = useRef(new Animated.Value(startY)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Drift: float to end, then back, looping forever
    const drift = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(x, { toValue: endX, duration, useNativeDriver: true }),
          Animated.timing(y, { toValue: endY, duration, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: maxOpacity, duration: duration * 0.4, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: maxOpacity * 0.3, duration: duration * 0.2, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: maxOpacity, duration: duration * 0.4, useNativeDriver: true }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(x, { toValue: startX, duration, useNativeDriver: true }),
          Animated.timing(y, { toValue: startY, duration, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: maxOpacity, duration: duration * 0.4, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: maxOpacity * 0.3, duration: duration * 0.2, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: maxOpacity, duration: duration * 0.4, useNativeDriver: true }),
          ]),
        ]),
      ])
    );

    const timeout = setTimeout(() => drift.start(), delay);
    return () => {
      clearTimeout(timeout);
      drift.stop();
    };
  }, []);

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        fontSize: size,
        color: Colors.accent,
        opacity,
        transform: [{ translateX: x }, { translateY: y }],
        textShadowColor: Colors.accent,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: size * 2.5,
      }}
    >
      ◆
    </Animated.Text>
  );
}

function DiamondField() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {DIAMONDS.map((d) => (
        <FloatingDiamond key={d.id} {...d} />
      ))}
    </View>
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
  const mainScale = useRef(new Animated.Value(1)).current;
  const mainOpacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(mainScale, { toValue: 1.18, duration: 1500, useNativeDriver: true }),
          Animated.timing(mainOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(mainScale, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(mainOpacity, { toValue: 0.7, duration: 1500, useNativeDriver: true }),
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
        <DiamondField />
        <Animated.Text
          style={[styles.mainDiamond, {
            transform: [{ scale: mainScale }],
            opacity: mainOpacity,
            textShadowColor: Colors.accent,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 30,
          }]}
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
      {/* Live floating diamonds */}
      <DiamondField />


      {/* Gold top bar */}
      <View style={styles.topBar} />

      {/* Hero */}
      <View style={styles.hero}>
        <Animated.Text
          style={[styles.mainDiamond, {
            transform: [{ scale: mainScale }],
            opacity: mainOpacity,
            textShadowColor: Colors.accent,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 30,
          }]}
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
    fontSize: 48,
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
