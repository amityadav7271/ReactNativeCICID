declare module 'react-native-reanimated/mock' {
  import { Animated } from 'react-native';
  const ReanimatedMock: typeof Animated;
  export default ReanimatedMock;
}
