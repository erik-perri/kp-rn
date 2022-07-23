import React, {FunctionComponent} from 'react';
import {Button, ScrollView, Text} from 'react-native';

import {useLockState} from '../components/LockStateProvider';

const IndexScreen: FunctionComponent = () => {
  const {database, lockDatabase} = useLockState();

  return (
    <ScrollView>
      <Button title="Lock" onPress={lockDatabase} />
      <Text>{JSON.stringify(database?.rootGroup, null, 2)}</Text>
    </ScrollView>
  );
};

export default IndexScreen;
