import React, { useEffect } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
  useAnimatedStyle,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function InfinityLoader() {
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 7000,
        easing: Easing.linear,
      }),
      -1,
    );

    scale.value = withRepeat(
      withTiming(1.04, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const getPoint = (t) => {
    const a = 140;
    const angle = t * 2 * Math.PI;

    const x = 200 + (a * Math.cos(angle)) / (1 + Math.sin(angle) ** 2);

    const y =
      200 +
      (a * Math.sin(angle) * Math.cos(angle)) / (1 + Math.sin(angle) ** 2);

    return { x, y };
  };

  const NUM_DOTS = 50;

  const renderDots = (color, reverse = false) => {
    return [...Array(NUM_DOTS)].map((_, i) => {
      const animatedProps = useAnimatedProps(() => {
        let t = (progress.value + i / NUM_DOTS) % 1;
        if (reverse) t = 1 - t;

        const p = getPoint(t);

        const sizeFactor = Math.sin(Math.PI * (i / NUM_DOTS));

        return {
          cx: p.x,
          cy: p.y,
          opacity: 0.15 + sizeFactor * 0.85,
          r: 2 + sizeFactor * 6,
        };
      });

      return (
        <AnimatedCircle
          key={`${color}-${i}`}
          fill={color}
          animatedProps={animatedProps}
        />
      );
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: Math.sin(progress.value * 6) * 1.5 },
      { translateY: Math.cos(progress.value * 6) * 1.5 },
    ],
  }));

  return (
    <AnimatedView style={animatedStyle}>
      <Svg width={420} height={420}>
        {renderDots("rgba(0, 229, 192, 0.15)", true)}

        {renderDots("#00e5c0", true)}
        {renderDots("#d9d9d9", false)}
      </Svg>
    </AnimatedView>
  );
}
