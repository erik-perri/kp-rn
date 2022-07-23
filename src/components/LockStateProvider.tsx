import React, {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import {Database} from '../lib/core/Database';

export interface LockState {
  database: Database | undefined;
  isUnlocked: boolean;
  lockDatabase: () => void;
  unlockDatabase: (database: Database) => void;
}

const LockStateContext = createContext<LockState>({
  database: undefined,
  isUnlocked: false,
  lockDatabase: () => {},
  unlockDatabase: () => {},
});

const LockStateProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [database, setDatabase] = useState<Database>();
  const isUnlocked = useMemo<boolean>(
    () => Boolean(database?.rootGroup),
    [database],
  );

  const unlockDatabase = useCallback((unlockedDatabase: Database) => {
    setDatabase(unlockedDatabase);
  }, []);

  const lockDatabase = useCallback(() => {
    setDatabase(undefined);
  }, []);

  return (
    <LockStateContext.Provider
      value={{
        database,
        isUnlocked,
        lockDatabase,
        unlockDatabase,
      }}>
      {children}
    </LockStateContext.Provider>
  );
};

export const useLockState = () => useContext(LockStateContext);

export default LockStateProvider;
