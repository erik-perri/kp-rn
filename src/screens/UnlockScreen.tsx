import React, {FunctionComponent, useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Modal,
  Pressable,
  Switch,
  TextInput,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';

import {
  isFileKeySetting,
  isHardwareKeySetting,
  KeyType,
  useActiveFile,
} from '../components/ActiveFileProvider';
import Box from '../components/Box';
import {useLockState} from '../components/LockStateProvider';
import ScrollViewFill from '../components/ScrollViewFill';
import Text from '../components/Text';
import useLightDark from '../hooks/useLightDark';
import Kdbx4Reader from '../lib/format/Kdbx4Reader';
import ChallengeResponseKey from '../lib/keys/ChallengeResponseKey';
import CompositeKey from '../lib/keys/CompositeKey';
import FileKey from '../lib/keys/FileKey';
import {Key} from '../lib/keys/Key';
import PasswordKey from '../lib/keys/PasswordKey';
import KpHelperModule, {
  useHardwareKeyList,
} from '../lib/utilities/KpHelperModule';
import {MainStackScreenProps} from '../navigation/MainStack';

const UnlockScreen: FunctionComponent<MainStackScreenProps<'Unlock'>> = ({
  navigation,
}) => {
  const {activeFile, addKey, removeKey} = useActiveFile();
  const {unlockDatabase} = useLockState();
  const [password, setPassword] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const hardwareKeys = useHardwareKeyList();

  const borderColor = useLightDark('slate.300', 'slate.800');

  const onChooseDifferentFile = useCallback(async () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('FileSelect');
    }
  }, [navigation]);

  const onChooseNoFileKey = useCallback(async () => {
    await removeKey(KeyType.File);
  }, [removeKey]);

  const onChooseFileKey = useCallback(async () => {
    const pickerResult = await DocumentPicker.pickSingle({
      copyTo: 'cachesDirectory',
    });

    if (!pickerResult.fileCopyUri) {
      Alert.alert('Error', `Failed to open file.\n\n${pickerResult.copyError}`);
      return;
    }

    await addKey({
      type: KeyType.File,
      data: {
        name: pickerResult.name,
        size: pickerResult.size ?? -1,
        uri: pickerResult.fileCopyUri,
      },
    });
  }, [addKey]);

  const onChooseNoHardwareKey = useCallback(async () => {
    await removeKey(KeyType.ChallengeResponse);
  }, [removeKey]);

  const onChooseHardwareKey = useCallback(
    async (id: string, name: string) => {
      console.log('onChooseHardwareKey', id, name);
      await addKey({
        type: KeyType.ChallengeResponse,
        data: {id, name},
      });
    },
    [addKey],
  );

  const onUnlock = useCallback(async () => {
    if (!activeFile) {
      console.error('No file');
      return;
    }

    setUnlocking(true);

    try {
      console.log('Reading file', activeFile.file.uri);
      const fileBytes = await KpHelperModule.readFile(activeFile.file.uri);
      console.log(`Read ${fileBytes.byteLength} bytes`);

      const parser = new Kdbx4Reader();
      const keys: Key[] = [];

      const passwordKey = new PasswordKey();
      await passwordKey.setPassword(password);
      keys.push(passwordKey);

      setPassword('');

      for (const specifiedKey of activeFile.keys) {
        switch (specifiedKey.type) {
          case KeyType.ChallengeResponse:
            keys.push(new ChallengeResponseKey(specifiedKey.data.id));
            break;
          case KeyType.File: {
            const fileKey = new FileKey();

            console.log('Reading file', specifiedKey.data.uri);
            const keyFileBytes = await KpHelperModule.readFile(
              specifiedKey.data.uri,
            );
            console.log(`Read ${keyFileBytes.byteLength} bytes`);

            await fileKey.load(keyFileBytes);
            keys.push(fileKey);
            break;
          }
        }
      }

      const database = await parser.readDatabase(
        fileBytes,
        new CompositeKey(keys),
      );

      setUnlocking(false);
      unlockDatabase(database);
      navigation.navigate('Index');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      Alert.alert('Failed', `Unlock failed\n\n${message}`);
      setUnlocking(false);
    }
  }, [activeFile, navigation, password, unlockDatabase]);

  const fileKeySetting = useMemo(
    () => activeFile?.keys.find(isFileKeySetting)?.data,
    [activeFile],
  );

  const hardwareKeySetting = useMemo(
    () => activeFile?.keys.find(isHardwareKeySetting)?.data,
    [activeFile],
  );

  if (!activeFile) {
    return <ActivityIndicator />;
  }

  return (
    <ScrollViewFill>
      <Box flex={1} justifyContent="space-between" padding={5}>
        <Box marginBottom={2}>
          <Text fontSize={24}>Unlock {activeFile.file.name}</Text>

          <Box marginTop={5}>
            <Button
              title="Choose different file"
              onPress={onChooseDifferentFile}
            />
          </Box>
        </Box>

        <Box marginTop={5} marginBottom={5}>
          <Box
            borderColor={borderColor}
            borderWidth={1}
            marginBottom={5}
            padding={3}>
            <Text>Password</Text>
            <Box borderWidth={1} borderColor={borderColor} marginTop={2}>
              <TextInput
                secureTextEntry
                onChangeText={value => setPassword(value)}
                value={password}
              />
            </Box>
          </Box>

          <Box
            borderColor={borderColor}
            borderWidth={1}
            marginBottom={5}
            padding={3}>
            <Text>Key file</Text>
            <Box marginTop={2} flexDirection="row">
              <Box flex={1} justifyContent="center">
                <Text>{fileKeySetting ? fileKeySetting.name : 'None'}</Text>
              </Box>
              {fileKeySetting ? (
                <Button title="Clear" onPress={onChooseNoFileKey} />
              ) : (
                <Button title="Browse" onPress={onChooseFileKey} />
              )}
            </Box>
          </Box>

          <Box borderColor={borderColor} borderWidth={1} padding={3}>
            <Text>Hardware key</Text>
            <Box marginTop={2}>
              <Box flexDirection="row">
                <Switch
                  value={hardwareKeySetting === undefined}
                  onChange={onChooseNoHardwareKey}
                />
                <Pressable onPress={onChooseNoHardwareKey}>
                  <Text>None</Text>
                </Pressable>
              </Box>
              {Object.entries(hardwareKeys).map(([id, name]) => (
                <Box flexDirection="row" key={id}>
                  <Switch
                    value={hardwareKeySetting?.id === id}
                    onChange={() => onChooseHardwareKey(id, name)}
                  />
                  <Pressable onPress={() => onChooseHardwareKey(id, name)}>
                    <Text>{name}</Text>
                  </Pressable>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Button title="Unlock" onPress={onUnlock} />
      </Box>

      <Modal transparent visible={unlocking}>
        <Box
          flex={1}
          backgroundColor={['black', 50]}
          justifyContent="center"
          alignItems="center">
          <Box marginBottom={5}>
            <ActivityIndicator />
          </Box>
          <Text fontSize={24}>Unlocking</Text>
          {hardwareKeySetting === undefined ? undefined : (
            <Box marginTop={5}>
              <Text fontSize={16} textAlign="center">
                If your hardware key has touch enabled,{'\n'}
                do so now.
              </Text>
            </Box>
          )}
        </Box>
      </Modal>
    </ScrollViewFill>
  );
};

export default UnlockScreen;
