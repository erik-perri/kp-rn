import {NativeModules} from 'react-native';
import {CryptoHashAlgorithm} from '../crypto/CryptoHash';

const {KpHelperModule} = NativeModules;

export interface NativeHelperModule {
  transformAesKdfKey(
    key: Uint8Array | number[],
    seed: Uint8Array | number[],
    iterations: number,
  ): Promise<number[]>;

  readFile(file: string): Promise<number[]>;

  createHash(
    data: number[][],
    algorithm: CryptoHashAlgorithm,
  ): Promise<number[]>;

  createHmac(
    key: number[],
    data: number[][],
    algorithm: CryptoHashAlgorithm,
  ): Promise<number[]>;
}

export class LocalHelperModule {
  constructor(private module: NativeHelperModule) {}

  async transformAesKdfKey(
    key: Uint8Array,
    seed: Uint8Array,
    iterations: number,
  ): Promise<number[]> {
    return await this.module.transformAesKdfKey(
      [...key.values()],
      [...seed.values()],
      iterations,
    );
  }

  async readFile(file: string): Promise<number[]> {
    return await this.module.readFile(file);
  }

  async createHash(
    data: Uint8Array[],
    algorithm: CryptoHashAlgorithm,
  ): Promise<number[]> {
    return await this.module.createHash(
      data.map(datum => [...datum.values()]),
      algorithm,
    );
  }

  async createHmac(
    key: Uint8Array,
    data: Uint8Array[],
    algorithm: CryptoHashAlgorithm,
  ): Promise<number[]> {
    return this.module.createHmac(
      [...key.values()],
      data.map(datum => [...datum.values()]),
      algorithm,
    );
  }
}

export default new LocalHelperModule(KpHelperModule as NativeHelperModule);
