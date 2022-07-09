import React, {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';

interface LockState {
  file: string | undefined;
  isUnlocked: boolean;
}

const LockStateContext = createContext<LockState>({
  file: undefined,
  isUnlocked: false,
});

const LockStateProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [file, setFile] = useState<string>();
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  return (
    <LockStateContext.Provider
      value={{
        file,
        isUnlocked,
      }}>
      {children}
    </LockStateContext.Provider>
  );
};

export const useLockState = () => useContext(LockStateContext);

export default LockStateProvider;
