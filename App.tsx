import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import React from 'react';

import ActiveFileProvider from './src/components/ActiveFileProvider';
import LockStateProvider from './src/components/LockStateProvider';
import useLightDark from './src/hooks/useLightDark';
import MainStack from './src/navigation/MainStack';

const App = () => {
  const theme = useLightDark(DefaultTheme, DarkTheme);
  return (
    <ActiveFileProvider>
      <LockStateProvider>
        <NavigationContainer theme={theme}>
          <MainStack />
        </NavigationContainer>
      </LockStateProvider>
    </ActiveFileProvider>
  );
};

export default App;
