import React, {FunctionComponent, useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';

import {
  isKeyFileSetting,
  isKeyYubikeySetting,
  KeySetting,
  KeyType,
  useLockState,
} from '../components/LockStateProvider';
import Kdbx4Reader from '../lib/format/Kdbx4Reader';
import ChallengeResponseKey from '../lib/keys/ChallengeResponseKey';
import CompositeKey from '../lib/keys/CompositeKey';
import FileKey from '../lib/keys/FileKey';
import {Key} from '../lib/keys/Key';
import PasswordKey from '../lib/keys/PasswordKey';
import KpHelperModule, {
  useHardwareKeyList,
} from '../lib/utilities/KpHelperModule';

const UnlockScreen: FunctionComponent = () => {
  const {file, unlockDatabase, updateFile} = useLockState();
  const [password, setPassword] = useState('');
  const hardwareKeys = useHardwareKeyList();

  const onChooseDifferentFile = useCallback(async () => {
    await updateFile(undefined);
  }, [updateFile]);

  const onChooseNoFileKey = useCallback(async () => {
    if (!file) {
      return;
    }

    await updateFile({
      ...file,
      keys: file.keys?.filter(key => key.type !== KeyType.File),
    });
  }, [file, updateFile]);

  const onChooseFileKey = useCallback(async () => {
    if (!file) {
      return;
    }

    const pickerResult = await DocumentPicker.pickSingle({
      copyTo: 'cachesDirectory',
    });

    if (!pickerResult.fileCopyUri) {
      Alert.alert('Error', `Failed to open file.\n${pickerResult.copyError}`);
      return;
    }

    const keys: KeySetting[] = [
      ...file.keys,
      {
        type: KeyType.File,
        data: {
          name: pickerResult.name,
          size: pickerResult.size ?? -1,
          uri: pickerResult.fileCopyUri,
        },
      },
    ];

    await updateFile({
      ...file,
      keys,
    });
  }, [file, updateFile]);

  const onChooseNoHardwareKey = useCallback(async () => {
    if (!file) {
      return;
    }

    await updateFile({
      ...file,
      keys: file.keys?.filter(key => key.type !== KeyType.ChallengeResponse),
    });
  }, [file, updateFile]);

  const onChooseHardwareKey = useCallback(
    async (id: string) => {
      if (!file) {
        return;
      }

      const keys: KeySetting[] = [
        ...file.keys?.filter(key => key.type !== KeyType.ChallengeResponse),
        {
          type: KeyType.ChallengeResponse,
          data: id,
        },
      ];

      await updateFile({
        ...file,
        keys,
      });
    },
    [file, updateFile],
  );

  const onUnlock = useCallback(async () => {
    if (!file) {
      console.error('No file');
      return;
    }

    console.log('Reading file', file.file.uri);
    const fileBytes = await KpHelperModule.readFile(file.file.uri);
    console.log(`Read ${fileBytes.byteLength} bytes`);

    const parser = new Kdbx4Reader();
    const keys: Key[] = [];

    const passwordKey = new PasswordKey();
    await passwordKey.setPassword(password);
    keys.push(passwordKey);

    for (const specifiedKey of file.keys) {
      switch (specifiedKey.type) {
        case KeyType.ChallengeResponse:
          keys.push(new ChallengeResponseKey(specifiedKey.data));
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

    unlockDatabase(database);
  }, [file, password, unlockDatabase]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 24,
          zIndex: 0,
        },
        heading: {
          fontSize: 24,
          marginBottom: 16,
        },
        box: {
          backgroundColor: '#666',
          padding: 24,
          marginBottom: 24,
        },
        credentials: {
          width: '100%',
        },
        keyFile: {
          flexGrow: 1,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
        },
      }),
    [],
  );

  const fileKeySetting = useMemo(
    () => file?.keys.find(isKeyFileSetting)?.data,
    [file],
  );

  const yubikeyKeySetting = useMemo(
    () => file?.keys.find(isKeyYubikeySetting)?.data,
    [file],
  );

  if (!file) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView style={styles.root}>
      <View>
        <Text style={styles.heading}>Unlock {file.file.name}</Text>
        <Button title="Choose different file" onPress={onChooseDifferentFile} />
      </View>

      <View style={styles.credentials}>
        <View style={styles.box}>
          <Text>Password</Text>
          <TextInput
            secureTextEntry
            onChangeText={value => setPassword(value)}
            value={password}
          />
        </View>
        <View style={styles.box}>
          <Text>Key file</Text>
          <View style={styles.row}>
            <Text style={styles.keyFile}>
              {fileKeySetting ? fileKeySetting.name : 'None'}
            </Text>
            {fileKeySetting ? (
              <Button title="Clear" onPress={onChooseNoFileKey} />
            ) : (
              <Button title="Browse" onPress={onChooseFileKey} />
            )}
          </View>
        </View>
        <View style={styles.box}>
          <Text>Hardware key</Text>
          <Pressable onPress={onChooseNoHardwareKey} style={styles.row}>
            <Switch
              value={yubikeyKeySetting === undefined}
              onChange={onChooseNoHardwareKey}
            />
            <Text>None</Text>
          </Pressable>
          {Object.entries(hardwareKeys).map(([id, name]) => (
            <Pressable
              key={id}
              onPress={() => onChooseHardwareKey(id)}
              style={styles.row}>
              <Switch
                value={yubikeyKeySetting === id}
                onChange={() => onChooseHardwareKey(id)}
              />
              <Text>{name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Button title="Unlock" onPress={onUnlock} />
    </SafeAreaView>
  );
};

export default UnlockScreen;
