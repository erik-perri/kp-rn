import React, {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {AsyncStorage, LogBox} from 'react-native';

import {Database} from '../lib/core/Database';

export enum KeyType {
  Password,
  File,
  ChallengeResponse,
}

export interface LoadedFile {
  name: string;
  size: number;
  uri: string;
}

export interface KeyPasswordSetting {
  type: KeyType.Password;
}

export interface KeyFileSetting {
  type: KeyType.File;
  data: LoadedFile;
}

export interface KeyYubikeySetting {
  type: KeyType.ChallengeResponse;
  data: string;
}

export type KeySetting =
  | KeyPasswordSetting
  | KeyFileSetting
  | KeyYubikeySetting;

export function isKeyFileSetting(key: KeySetting): key is KeyFileSetting {
  return key.type === KeyType.File;
}

export function isKeyYubikeySetting(key: KeySetting): key is KeyYubikeySetting {
  return key.type === KeyType.ChallengeResponse;
}

export interface ActiveFile {
  file: LoadedFile;
  keys: KeySetting[];
}

export interface LockState {
  database: Database | undefined;
  file: ActiveFile | undefined;
  isUnlocked: boolean;
  lockDatabase: () => void;
  unlockDatabase: (database: Database) => void;
  updateFile: (updatedFile: ActiveFile | undefined) => Promise<void>;
}

const LockStateContext = createContext<LockState>({
  database: undefined,
  file: undefined,
  isUnlocked: false,
  lockDatabase: () => {},
  unlockDatabase: () => {},
  updateFile: () => Promise.resolve(),
});

LogBox.ignoreLogs([/AsyncStorage has been extracted/]);

const LockStateProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [file, setFile] = useState<ActiveFile>();
  const [database, setDatabase] = useState<Database>();
  const isUnlocked = useMemo<boolean>(
    () => Boolean(database?.rootGroup),
    [database],
  );

  const updateFile = useCallback(
    async (updatedFile: ActiveFile | undefined) => {
      setFile(updatedFile);
      if (updatedFile) {
        await AsyncStorage.setItem('loaded-file', JSON.stringify(updatedFile));
      } else {
        await AsyncStorage.removeItem('loaded-file');
      }
    },
    [],
  );

  const unlockDatabase = useCallback((unlockedDatabase: Database) => {
    setDatabase(unlockedDatabase);
  }, []);

  const lockDatabase = useCallback(() => {
    setDatabase(undefined);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('loaded-file').then(encoded => {
      if (encoded) {
        setFile(JSON.parse(encoded));
      }
    });
  }, []);

  return (
    <LockStateContext.Provider
      value={{
        database,
        file,
        isUnlocked,
        lockDatabase,
        unlockDatabase,
        updateFile,
      }}>
      {children}
    </LockStateContext.Provider>
  );
};

export const useLockState = () => useContext(LockStateContext);

export default LockStateProvider;
