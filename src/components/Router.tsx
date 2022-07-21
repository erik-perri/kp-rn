import React, {FunctionComponent} from 'react';

import FileSelectScreen from '../screens/FileSelectScreen';
import IndexScreen from '../screens/IndexScreen';
import UnlockScreen from '../screens/UnlockScreen';
import {useLockState} from './LockStateProvider';

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
