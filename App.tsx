import React from 'react';

import LockStateProvider from './src/components/LockStateProvider';
import Router from './src/components/Router';

const App = () => {
  return (
    <LockStateProvider>
      <Router />
    </LockStateProvider>
  );
};

export default App;
