import React from 'react';

import ActiveFileProvider from './src/components/ActiveFileProvider';
import LockStateProvider from './src/components/LockStateProvider';
import Router from './src/components/Router';

const App = () => {
  return (
    <ActiveFileProvider>
      <LockStateProvider>
        <Router />
      </LockStateProvider>
    </ActiveFileProvider>
  );
};

export default App;
