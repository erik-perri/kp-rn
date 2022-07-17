import {NativeModules} from 'react-native';
import {CryptoHashAlgorithm} from '../crypto/CryptoHash';
import {
  SymmetricCipherDirection,
  SymmetricCipherMode,
} from '../crypto/SymmetricCipher';

const {KpHelperModule} = NativeModules;

export interface NativeHelperModule {
  transformAesKdfKey(
    key: Uint8Array | number[],
    seed: Uint8Array | number[],
    iterations: number,
  ): Promise<number[]>;

  readFile(file: string): Promise<number[]>;

  hash(algorithm: CryptoHashAlgorithm, chunks: number[][]): Promise<number[]>;

  hmac(
    algorithm: CryptoHashAlgorithm,
    key: number[],
    chunks: number[][],
  ): Promise<number[]>;

  cipher(
    mode: number,
    direction: number,
    key: number[],
    iv: number[],
    data: number[],
  ): Promise<number[]>;
}

export class LocalHelperModule {
  constructor(private module: NativeHelperModule) {}

  async transformAesKdfKey(
    key: Uint8Array,
    seed: Uint8Array,
    iterations: number,
  ): Promise<Uint8Array> {
    return Uint8Array.from(
      await this.module.transformAesKdfKey([...key], [...seed], iterations),
    );
  }

  async readFile(file: string): Promise<Uint8Array> {
    return Uint8Array.from(await this.module.readFile(file));
  }

  async hash(
    algorithm: CryptoHashAlgorithm,
    data: Uint8Array[],
  ): Promise<Uint8Array> {
    return Uint8Array.from(
      await this.module.hash(
        algorithm,
        data.map(datum => [...datum]),
      ),
    );
  }

  async hmac(
    algorithm: CryptoHashAlgorithm,
    key: Uint8Array,
    data: Uint8Array[],
  ): Promise<Uint8Array> {
    return Uint8Array.from(
      await this.module.hmac(
        algorithm,
        [...key],
        data.map(datum => [...datum]),
      ),
    );
  }

  async cipher(
    mode: SymmetricCipherMode,
    direction: SymmetricCipherDirection,
    key: Uint8Array,
    iv: Uint8Array,
    data: Uint8Array,
  ): Promise<Uint8Array> {
    return Uint8Array.from(
      await this.module.cipher(mode, direction, [...key], [...iv], [...data]),
    );
  }
}

export default new LocalHelperModule(KpHelperModule as NativeHelperModule);
