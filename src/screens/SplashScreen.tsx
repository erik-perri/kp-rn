import React, {FunctionComponent} from 'react';
import {ActivityIndicator} from 'react-native';

import Box from '../components/Box';
import Text from '../components/Text';
import useLightDark from '../hooks/useLightDark';

const SplashScreen: FunctionComponent = () => {
  // This is rendered outside a stack, so it does not include the navigation
  // background.
  const backgroundColor = useLightDark('slate.50', 'black');

  return (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="center"
      backgroundColor={backgroundColor}>
      <Box marginBottom={5}>
        <ActivityIndicator />
      </Box>
      <Text fontSize={24}>Loading</Text>
    </Box>
  );
};

export default SplashScreen;
