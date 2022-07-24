import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

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

export interface PasswordKeySetting {
  type: KeyType.Password;
}

export interface FileKeySetting {
  type: KeyType.File;
  data: LoadedFile;
}

export interface HardwareKeySetting {
  type: KeyType.ChallengeResponse;
  data: {
    id: string;
    name: string;
  };
}

export type KeySetting =
  | PasswordKeySetting
  | FileKeySetting
  | HardwareKeySetting;

export function isFileKeySetting(key: KeySetting): key is FileKeySetting {
  return key.type === KeyType.File;
}

export function isHardwareKeySetting(
  key: KeySetting,
): key is HardwareKeySetting {
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
  loading: boolean;
  removeKey: (type: KeyType) => Promise<void>;
  setFile: (file: LoadedFile, keys: KeySetting[]) => Promise<void>;
}

const ActiveFileContext = createContext<ActiveFileState>({
  activeFile: undefined,
  addKey: () => Promise.resolve(),
  clearFile: () => Promise.resolve(),
  loading: true,
  removeKey: () => Promise.resolve(),
  setFile: () => Promise.resolve(),
});

const ActiveFileProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [activeFile, setActiveFile] = useState<ActiveFile>();
  const [loading, setLoading] = useState<boolean>(true);

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

      setLoading(false);
    });
  }, []);

  return (
    <ActiveFileContext.Provider
      value={{
        activeFile,
        addKey,
        clearFile,
        loading,
        removeKey,
        setFile,
      }}>
      {children}
    </ActiveFileContext.Provider>
  );
};

export const useActiveFile = () => useContext(ActiveFileContext);

export default ActiveFileProvider;
