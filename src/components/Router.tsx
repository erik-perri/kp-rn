import React, {FunctionComponent} from 'react';

import FileSelectScreen from '../screens/FileSelectScreen';
import IndexScreen from '../screens/IndexScreen';
import UnlockScreen from '../screens/UnlockScreen';
import {useActiveFile} from './ActiveFileProvider';
import {useLockState} from './LockStateProvider';

const Router: FunctionComponent = () => {
  const {activeFile} = useActiveFile();
  const {isUnlocked} = useLockState();

  if (!activeFile) {
    return <FileSelectScreen />;
  }

  if (!isUnlocked) {
    return <UnlockScreen />;
  }

  return <IndexScreen />;
};

export default Router;
