import { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { storage } from '@/lib/storage';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    icon: '◆',
    title: 'AI-Powered Picks',
    subtitle: 'Stop guessing. Start winning.',
    body: 'Every pick is backed by real predictive models so your decisions are informed and intentional.',
  },
  {
    key: '2',
    icon: '↗',
    title: 'Transparent Track Record',
    subtitle: 'Every bet. Logged. Verified.',
    body: 'Full public archive of every pick ever posted — wins, losses, and all. No cherry-picking.',
  },
  {
    key: '3',
    icon: '⚡',
    title: 'Built Around You',
    subtitle: 'Your sports. Your way.',
    body: "Tell us what you bet on and we'll put your picks front and center every single day.",
  },
];

// Floating particle dot
function Particle({ style }: { style: object }) {
  const opacity = useRef(new Animated.Value(Math.random() * 0.4 + 0.1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: Math.random() * 0.5 + 0.3,
          duration: 1800 + Math.random() * 1200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: Math.random() * 0.1 + 0.05,
          duration: 1800 + Math.random() * 1200,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return <Animated.View style={[styles.particle, style, { opacity }]} />;
}

function ParticleField() {
  const particles = [
    { top: height * 0.08, left: width * 0.12 },
    { top: height * 0.14, left: width * 0.82 },
    { top: height * 0.22, left: width * 0.06 },
    { top: height * 0.28, left: width * 0.88 },
    { top: height * 0.38, left: width * 0.15 },
    { top: height * 0.45, left: width * 0.78 },
    { top: height * 0.55, left: width * 0.08 },
    { top: height * 0.62, left: width * 0.72 },
    { top: height * 0.72, left: width * 0.25 },
    { top: height * 0.78, left: width * 0.85 },
    { top: height * 0.85, left: width * 0.45 },
    { top: height * 0.18, left: width * 0.55 },
  ];

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map((pos, i) => (
        <Particle key={i} style={{ top: pos.top, left: pos.left }} />
      ))}
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  async function finish() {
    await storage.setOnboardingSeen();
    router.replace('/(auth)/sports');
  }

  function next() {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      finish();
    }
  }

  return (
    <View style={styles.screen}>
      <ParticleField />

      {/* Radial glow in center */}
      <View style={styles.glow} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea}>
        {/* Skip */}
        <TouchableOpacity style={styles.skipBtn} onPress={finish}>
          <Text style={styles.skipText}>SKIP</Text>
        </TouchableOpacity>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={(s) => s.key}
          horizontal
          pagingEnabled
          scrollEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(idx);
          }}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              {/* Icon circle */}
              <View style={styles.iconRing}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>{item.icon}</Text>
                </View>
              </View>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          )}
        />

        {/* Pagination dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        {/* CTA button */}
        <TouchableOpacity style={styles.button} onPress={next} activeOpacity={0.85}>
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? "LET'S GO" : 'NEXT'}
          </Text>
        </TouchableOpacity>
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
  glow: {
    position: 'absolute',
    top: height * 0.25,
    left: width * 0.1,
    width: width * 0.8,
    height: height * 0.4,
    borderRadius: 999,
    backgroundColor: Colors.accent,
    opacity: 0.04,
  },
  particle: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  skipBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  skipText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.textDim,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  iconRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5,
    borderColor: Colors.accent + '60',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  iconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 32,
    color: Colors.accent,
  },
  title: {
    fontFamily: Fonts.bodyBold,
    fontSize: 26,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.accent,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.sm,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.borderStrong,
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  button: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 1.5,
    color: Colors.bg,
  },
});
