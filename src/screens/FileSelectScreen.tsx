import React, {FunctionComponent, useCallback, useMemo} from 'react';
import {Alert, Button, StyleSheet, Text, View} from 'react-native';
import DocumentPicker from 'react-native-document-picker';

import {useLockState} from '../components/LockStateProvider';

const FileSelectScreen: FunctionComponent = () => {
  const {updateFile} = useLockState();

  const onSelectFile = useCallback(async () => {
    const pickerResult = await DocumentPicker.pickSingle({
      copyTo: 'cachesDirectory',
    });
    if (!pickerResult.fileCopyUri) {
      Alert.alert('Error', `Failed to open file.\n${pickerResult.copyError}`);
      return;
    }

    await updateFile({
      file: {
        name: pickerResult.name,
        size: pickerResult.size ?? -1,
        uri: pickerResult.fileCopyUri,
      },
      keys: [],
    });
  }, [updateFile]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {flex: 1, alignItems: 'center', justifyContent: 'center'},
        heading: {fontSize: 24, marginBottom: 16},
      }),
    [],
  );

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>Choose a file</Text>

      <Button title="Browse" onPress={onSelectFile} />
    </View>
  );
};

export default FileSelectScreen;
