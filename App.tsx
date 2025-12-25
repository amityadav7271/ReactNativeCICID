import React from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import ReduxProvider from './src/providers/ReduxProvider';
import UsersScreen from './src/screens/UsersScreen';
import ErrorBoundary from './src/components/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <ReduxProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          <UsersScreen />
        </SafeAreaView>
      </ReduxProvider>
    </ErrorBoundary>
  );
};

export default App;
