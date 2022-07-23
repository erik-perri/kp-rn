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

export interface ActiveFileState {
  file: ActiveFile | undefined;
  updateFile: (updatedFile: ActiveFile | undefined) => Promise<void>;
}

const ActiveFileContext = createContext<ActiveFileState>({
  file: undefined,
  updateFile: () => Promise.resolve(),
});

LogBox.ignoreLogs([/AsyncStorage has been extracted/]);

const ActiveFileProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [file, setFile] = useState<ActiveFile>();

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

  useEffect(() => {
    AsyncStorage.getItem('loaded-file').then(encoded => {
      if (encoded) {
        setFile(JSON.parse(encoded));
      }
    });
  }, []);

  return (
    <ActiveFileContext.Provider
      value={{
        file,
        updateFile,
      }}>
      {children}
    </ActiveFileContext.Provider>
  );
};

export const useActiveFile = () => useContext(ActiveFileContext);

export default ActiveFileProvider;
