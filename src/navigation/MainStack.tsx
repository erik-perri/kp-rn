import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React, {FunctionComponent} from 'react';

import {useActiveFile} from '../components/ActiveFileProvider';
import {useLockState} from '../components/LockStateProvider';
import FileSelectScreen from '../screens/FileSelectScreen';
import IndexScreen from '../screens/IndexScreen';
import SplashScreen from '../screens/SplashScreen';
import UnlockScreen from '../screens/UnlockScreen';

export type MainStackParamList = {
  Unlock: undefined;
  Index: undefined;
  FileSelect: undefined;
};

export type MainStackScreenProps<RouteName extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, RouteName>;

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainStack: FunctionComponent = () => {
  const {loading, activeFile} = useActiveFile();
  const {isUnlocked} = useLockState();

  if (loading) {
    return <SplashScreen />;
  }

  let initialRouteName: keyof MainStackParamList = 'FileSelect';
  if (isUnlocked) {
    initialRouteName = 'Index';
  } else if (activeFile) {
    initialRouteName = 'Unlock';
  }

  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen
        name="FileSelect"
        component={FileSelectScreen}
        options={{
          headerShown: false,
        }}
      />
      {activeFile ? (
        <Stack.Screen
          name="Unlock"
          component={UnlockScreen}
          options={{
            headerShown: false,
          }}
        />
      ) : undefined}
      {isUnlocked ? (
        <Stack.Screen
          name="Index"
          component={IndexScreen}
          options={{
            headerShown: false,
          }}
        />
      ) : undefined}
    </Stack.Navigator>
  );
};

export default MainStack;
