import React, {FunctionComponent} from 'react';
import FileSelectScreen from '../screens/FileSelectScreen';
import {useLockState} from './LockStateProvider';
import UnlockScreen from '../screens/UnlockScreen';
import IndexScreen from '../screens/IndexScreen';

const Router: FunctionComponent = () => {
  const {file, isUnlocked} = useLockState();

  if (!file) {
    return <FileSelectScreen />;
  }

  if (!isUnlocked) {
    return <UnlockScreen />;
  }

  return <IndexScreen />;
};

export default Router;
