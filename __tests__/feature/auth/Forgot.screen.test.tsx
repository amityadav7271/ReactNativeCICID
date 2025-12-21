// __tests__/feature/auth/Forgot.screen.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import ForgotScreen from '@features/auth/Forgot.screen';

describe('ForgotScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<ForgotScreen />);
    expect(getByText('Forgot.screen')).toBeTruthy();
  });
});
