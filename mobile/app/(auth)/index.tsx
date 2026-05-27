import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  Alert, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { GoldButton } from '@/components/ui/GoldButton';
import { WhopAuthModal } from '@/components/auth/WhopAuthModal';
import { storage } from '@/lib/storage';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { buildWhopAuthUrl, exchangeCodeForToken } from '@/lib/whop';

const { width, height } = Dimensions.get('window');

const DIAMONDS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  startX: Math.random() * (width - 20),
  startY: Math.random() * (height - 20),
  endX: Math.random() * (width - 20),
  endY: Math.random() * (height - 20),
  size: 6 + Math.random() * 9,
  duration: 4000 + Math.random() * 5000,
  delay: Math.random() * 2500,
  maxOpacity: 0.15 + Math.random() * 0.5,
}));

function FloatingDiamond({ startX, startY, endX, endY, size, duration, delay, maxOpacity }: typeof DIAMONDS[0]) {
  const x = useSharedValue(startX);
  const y = useSharedValue(startY);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const ease = Easing.inOut(Easing.sin);

    x.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(endX, { duration, easing: ease }),
        withTiming(startX, { duration, easing: ease }),
      ), -1
    ));

    y.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(endY, { duration, easing: ease }),
        withTiming(startY, { duration, easing: ease }),
      ), -1
    ));

    opacity.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(maxOpacity, { duration: duration * 0.4 }),
        withTiming(maxOpacity * 0.2, { duration: duration * 0.2 }),
        withTiming(maxOpacity, { duration: duration * 0.4 }),
        withTiming(maxOpacity * 0.2, { duration: duration * 0.4 }),
        withTiming(maxOpacity, { duration: duration * 0.4 }),
        withTiming(0, { duration: duration * 0.2 }),
      ), -1
    ));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[{
        position: 'absolute',
        fontSize: size,
        color: Colors.accent,
        textShadowColor: Colors.accent,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: size * 2.5,
      }, style]}
    >
      ◆
    </Animated.Text>
  );
}

function DiamondField() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {DIAMONDS.map((d) => <FloatingDiamond key={d.id} {...d} />)}
    </View>
  );
}

function PulsingDiamond({ style: extraStyle }: { style?: object }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ), -1
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.7, { duration: 1500 }),
      ), -1
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[styles.mainDiamond, {
        textShadowColor: Colors.accent,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 30,
      }, style, extraStyle]}
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
        <PulsingDiamond />
        <ActivityIndicator color={Colors.accent} size="large" style={{ marginTop: 24 }} />
        <Text style={styles.processingText}>Signing you in…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <DiamondField />
      <View style={styles.topBar} />

      <View style={styles.hero}>
        <PulsingDiamond />
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
          loading={buttonLoading}
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
