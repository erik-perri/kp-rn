import React, {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {AsyncStorage, LogBox} from 'react-native';

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
  data: {
    id: string;
    name: string;
  };
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

export interface ActiveFileState {
  activeFile: ActiveFile | undefined;
  addKey: (key: KeySetting) => Promise<void>;
  clearFile: () => Promise<void>;
  removeKey: (type: KeyType) => Promise<void>;
  setFile: (file: LoadedFile, keys: KeySetting[]) => Promise<void>;
}

const ActiveFileContext = createContext<ActiveFileState>({
  activeFile: undefined,
  addKey: () => Promise.resolve(),
  clearFile: () => Promise.resolve(),
  removeKey: () => Promise.resolve(),
  setFile: () => Promise.resolve(),
});

LogBox.ignoreLogs([/AsyncStorage has been extracted/]);

const ActiveFileProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [activeFile, setActiveFile] = useState<ActiveFile>();

  const setFile = useCallback(async (file: LoadedFile, keys: KeySetting[]) => {
    const updatedFile: ActiveFile = {file, keys};
    await AsyncStorage.setItem('loaded-file', JSON.stringify(updatedFile));
    setActiveFile(updatedFile);
  }, []);

  const clearFile = useCallback(async () => {
    await AsyncStorage.removeItem('loaded-file');
    setActiveFile(undefined);
  }, []);

  const addKey = useCallback(
    async (key: KeySetting) => {
      if (!activeFile) {
        throw new Error('No active file to add key to');
      }

      const keys: KeySetting[] = [
        ...activeFile.keys.filter(existing => existing.type !== key.type),
        key,
      ];

      await setFile(activeFile.file, keys);
    },
    [activeFile, setFile],
  );

  const removeKey = useCallback(
    async (type: KeyType) => {
      if (!activeFile) {
        throw new Error('No active file to remove key from');
      }

      await setFile(
        activeFile.file,
        activeFile.keys.filter(key => key.type !== type),
      );
    },
    [activeFile, setFile],
  );

  useEffect(() => {
    AsyncStorage.getItem('loaded-file').then(encoded => {
      if (encoded) {
        setActiveFile(JSON.parse(encoded));
      }
    });
  }, []);

  return (
    <ActiveFileContext.Provider
      value={{
        activeFile,
        addKey,
        clearFile,
        removeKey,
        setFile,
      }}>
      {children}
    </ActiveFileContext.Provider>
  );
};

export const useActiveFile = () => useContext(ActiveFileContext);

export default ActiveFileProvider;
