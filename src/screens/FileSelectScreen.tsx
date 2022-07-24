import React, {FunctionComponent, useCallback} from 'react';
import {Alert, Button} from 'react-native';
import DocumentPicker from 'react-native-document-picker';

import {useActiveFile} from '../components/ActiveFileProvider';
import Box from '../components/Box';
import ScrollViewFill from '../components/ScrollViewFill';
import Text from '../components/Text';
import {MainStackScreenProps} from '../navigation/MainStack';

const FileSelectScreen: FunctionComponent<
  MainStackScreenProps<'FileSelect'>
> = ({navigation}) => {
  const {setFile} = useActiveFile();

  const onSelectFile = useCallback(async () => {
    const pickerResult = await DocumentPicker.pickSingle({
      copyTo: 'cachesDirectory',
    });
    if (!pickerResult.fileCopyUri) {
      Alert.alert('Error', `Failed to open file.\n${pickerResult.copyError}`);
      return;
    }

    await setFile(
      {
        name: pickerResult.name,
        size: pickerResult.size ?? -1,
        uri: pickerResult.fileCopyUri,
      },
      [],
    );

    navigation.navigate('Unlock');
  }, [navigation, setFile]);

  return (
    <ScrollViewFill>
      <Box flex={1} alignItems="center" justifyContent="center">
        <Text fontSize={24}>Choose a file</Text>

        <Box marginTop={20}>
          <Button title="Browse" onPress={onSelectFile} />
        </Box>
      </Box>
    </ScrollViewFill>
  );
};

export default FileSelectScreen;
