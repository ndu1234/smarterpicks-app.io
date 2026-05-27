import { useRef, useCallback } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

interface Props extends PressableProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  scaleTo?: number;   // default 0.965
  tension?: number;   // spring tension, default 200
  friction?: number;  // spring friction, default 20
}

/**
 * Drop-in Pressable replacement that physically compresses on press
 * and springs back — the key tactile micro-interaction that separates
 * premium apps from vibe-coded prototypes.
 */
export function PressableScale({
  children,
  style,
  scaleTo = 0.965,
  tension = 200,
  friction = 20,
  onPress,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: scaleTo,
      tension,
      friction,
      useNativeDriver: true,
    }).start();
  }, [scaleTo, tension, friction]);

  const pressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension,
      friction,
      useNativeDriver: true,
    }).start();
  }, [tension, friction]);

  return (
    <Pressable
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
