import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius } from '@/constants/theme';

const { width } = Dimensions.get('window');
const SHIMMER_WIDTH = width * 0.6;

// Base shimmer animation — shared timing so all skeletons pulse in sync
function useShimmer() {
  const translateX = useRef(new Animated.Value(-SHIMMER_WIDTH)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: width + SHIMMER_WIDTH,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return translateX;
}

// A single skeleton block with the shimmer sweep
export function SkeletonBlock({
  width: w,
  height: h,
  borderRadius = 6,
  style,
}: {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const translateX = useShimmer();

  return (
    <View
      style={[
        {
          width: w ?? '100%',
          height: h,
          borderRadius,
          backgroundColor: Colors.bgSurface,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={[
            'transparent',
            Colors.borderStrong + 'cc',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: SHIMMER_WIDTH, height: '100%' }}
        />
      </Animated.View>
    </View>
  );
}

// A skeleton that matches the shape of a PickCard
export function SkeletonPickCard() {
  return (
    <View style={styles.card}>
      {/* Top row: sport badge + units */}
      <View style={styles.topRow}>
        <SkeletonBlock width={44} height={20} borderRadius={4} />
        <SkeletonBlock width={60} height={14} borderRadius={4} />
        <View style={{ flex: 1 }} />
        <SkeletonBlock width={32} height={20} borderRadius={4} />
      </View>

      {/* Pick text + odds */}
      <View style={styles.pickRow}>
        <SkeletonBlock width="60%" height={28} borderRadius={4} />
        <SkeletonBlock width={56} height={24} borderRadius={4} />
      </View>

      {/* Second line of pick text */}
      <SkeletonBlock width="40%" height={28} borderRadius={4} style={{ marginTop: -8 }} />

      {/* Matchup */}
      <SkeletonBlock width="50%" height={12} borderRadius={4} />

      {/* Divider */}
      <View style={styles.divider} />

      {/* Reasoning */}
      <SkeletonBlock width="90%" height={12} borderRadius={4} />
      <SkeletonBlock width="65%" height={12} borderRadius={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 16,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
