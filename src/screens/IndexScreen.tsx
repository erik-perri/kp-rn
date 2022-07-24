import {useFocusEffect} from '@react-navigation/native';
import React, {FunctionComponent, useCallback} from 'react';
import {Button, ScrollView} from 'react-native';

import Box from '../components/Box';
import {useLockState} from '../components/LockStateProvider';
import Text from '../components/Text';

const IndexScreen: FunctionComponent = () => {
  const {database, lockDatabase} = useLockState();

  useFocusEffect(
    useCallback(() => {
      return lockDatabase;
    }, [lockDatabase]),
  );

  return (
    <Box flex={1} padding={20}>
      <Text fontSize={24}>{database?.metadata.name}</Text>
      <Box marginTop={20} marginBottom={20}>
        <Button title="Lock" onPress={lockDatabase} />
      </Box>
      <ScrollView>
        <Text fontFamily="monospace" fontSize={12}>
          {JSON.stringify(
            database?.rootGroup,
            (key, value) => {
              if (value instanceof Uint8Array) {
                return `Uint8Array[${value.byteLength}]`;
              }
              return value;
            },
            2,
          )}
        </Text>
      </ScrollView>
    </Box>
  );
};

export default IndexScreen;
