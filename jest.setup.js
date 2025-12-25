import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';

// Mock react-native components
jest.mock('react-native', () => ({
  TouchableOpacity: 'TouchableOpacity',
  View: 'View',
  Text: 'Text',
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((styles) => styles),
  },
  ActivityIndicator: 'ActivityIndicator',
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // Mock worklets
  Reanimated.default.call = () => {};

  // Mock Animated.Value and Animated.timing for old Animated API
  Reanimated.default.Value = function (value) {
    return { value, setValue: jest.fn(), addListener: jest.fn(), removeListener: jest.fn() };
  };
  Reanimated.default.timing = () => ({ start: jest.fn() });

  return Reanimated;
});

// Silence useNativeDriver warnings
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const ActualAnimated = jest.requireActual('react-native/Libraries/Animated/Animated');
  return {
    ...ActualAnimated,
    timing: jest.fn(() => ({ start: jest.fn() })),
    Value: jest.fn(),
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

// Mock react-native-config
jest.mock('react-native-config', () => ({
  API_URL: 'http://localhost:3000',
  API_BASE_URL: 'http://localhost:3000',
  ENV: 'test',
}));
