import {NativeModules} from 'react-native';

const {KpHelperModule} = NativeModules;

export interface HelperModule {
  transformAesKdfKey(
    key: Uint8Array | number[],
    seed: Uint8Array | number[],
    iterations: number,
  ): Promise<number[]>;
}

export default KpHelperModule as HelperModule;
