import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

const AnimatedCard = ({ children, style }: any) => (
  <Animated.View
    entering={FadeIn.duration(400)}
    exiting={FadeOut.duration(300)}
    layout={LinearTransition.springify()}
    className="bg-white my-2 dark:bg-gray-800 rounded-2xl p-4 shadow-md dark:shadow-gray-900"
    style={style}
  >
    {children}
  </Animated.View>
);

AnimatedCard.displayName = 'AnimatedCard';
export default AnimatedCard;