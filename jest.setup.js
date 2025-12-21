import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';

// Mock react-native-reanimated for Jest
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {}; // mock worklets
  return Reanimated;
});

// Silence useNativeDriver warnings
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const ActualAnimated = jest.requireActual(
    'react-native/Libraries/Animated/Animated',
  );
  return {
    ...ActualAnimated,
    timing: jest.fn(),
  };
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});
