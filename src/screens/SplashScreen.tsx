import {DarkTheme, DefaultTheme} from '@react-navigation/native';
import React, {FunctionComponent} from 'react';
import {ActivityIndicator} from 'react-native';

import Box from '../components/Box';
import useLightDark from '../hooks/useLightDark';

const SplashScreen: FunctionComponent = () => {
  // This is rendered outside a stack so it does not include the navigation
  // background.
  const backgroundColor = useLightDark(
    DefaultTheme.colors.background,
    DarkTheme.colors.background,
  );

  return (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="center"
      backgroundColor={backgroundColor}>
      <ActivityIndicator />
    </Box>
  );
};

export default SplashScreen;
