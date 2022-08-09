import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import React from 'react';

import ActiveFileProvider from './src/components/ActiveFileProvider';
import LockStateProvider from './src/components/LockStateProvider';
import ThemeProvider from './src/components/ThemeProvider';
import useLightDark from './src/hooks/useLightDark';
import MainStack from './src/navigation/MainStack';
import theme from './src/theme/theme';

const App = () => {
  const navigationTheme = useLightDark(DefaultTheme, DarkTheme);
  return (
    <ThemeProvider theme={theme}>
      <ActiveFileProvider>
        <LockStateProvider>
          <NavigationContainer theme={navigationTheme}>
            <MainStack />
          </NavigationContainer>
        </LockStateProvider>
      </ActiveFileProvider>
    </ThemeProvider>
  );
};

export default App;
