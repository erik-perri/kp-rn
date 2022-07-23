import {useCallback, useEffect, useState} from 'react';
import {NativeEventEmitter, NativeModules} from 'react-native';

import {CryptoHashAlgorithm} from '../crypto/CryptoHash';
import {Argon2Type, Argon2Version} from '../crypto/kdf/Argon2Kdf';
import {
  Cipher,
  SymmetricCipherDirection,
  SymmetricCipherMode,
} from '../crypto/SymmetricCipher';

const {KpHelperModule} = NativeModules;

export interface NativeHelperModule {
  transformAesKdfKey(
    key: number[],
    seed: number[],
    iterations: number,
  ): Promise<number[]>;

  transformArgon2KdfKey(
    key: number[],
    salt: number[],
    version: Argon2Version,
    type: Argon2Type,
    memory: number,
    parallelism: number,
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

  createCipher(
    mode: number,
    direction: number,
    key: number[],
    iv: number[],
  ): Promise<string>;

  processCipher(uuid: string, data: number[]): Promise<number[]>;

  finishCipher(uuid: string, data: number[]): Promise<number[]>;

  destroyCipher(uuid: string): Promise<boolean>;

  getHardwareKeys(): Promise<Record<string, string>>;

  challengeResponse(uuid: string, challenge: number[]): Promise<number[]>;
}

class CipherHandler implements Cipher {
  constructor(private module: NativeHelperModule, private uuid: string) {
    //
  }

  async process(data: Uint8Array): Promise<Uint8Array> {
    return Uint8Array.from(
      await this.module.processCipher(this.uuid, [...data]),
    );
  }

  async finish(data: Uint8Array): Promise<Uint8Array> {
    return Uint8Array.from(
      await this.module.finishCipher(this.uuid, [...data]),
    );
  }

  async destroy(): Promise<void> {
    await this.module.destroyCipher(this.uuid);
  }
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

  async transformArgon2KdfKey(
    key: Uint8Array,
    salt: Uint8Array,
    version: Argon2Version,
    type: Argon2Type,
    memory: number,
    parallelism: number,
    iterations: number,
  ): Promise<Uint8Array> {
    return Uint8Array.from(
      await this.module.transformArgon2KdfKey(
        [...key],
        [...salt],
        version,
        type,
        memory,
        parallelism,
        iterations,
      ),
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

  async createCipher(
    mode: SymmetricCipherMode,
    direction: SymmetricCipherDirection,
    key: Uint8Array,
    iv: Uint8Array,
  ): Promise<Cipher> {
    return new CipherHandler(
      this.module,
      await this.module.createCipher(mode, direction, [...key], [...iv]),
    );
  }

  async challengeResponse(
    uuid: string,
    challenge: Uint8Array,
  ): Promise<Uint8Array> {
    return Uint8Array.from(
      await this.module.challengeResponse(uuid, [...challenge]),
    );
  }
}

export default new LocalHelperModule(KpHelperModule as NativeHelperModule);

export const useHardwareKeyList = () => {
  const [data, setData] = useState<Record<string, string>>({});

  const refreshLogs = useCallback(async () => {
    const keys = await KpHelperModule.getHardwareKeys();

    setData(keys);
  }, []);

  useEffect(() => {
    refreshLogs().then();

    const eventEmitter = new NativeEventEmitter();
    const eventListener = eventEmitter.addListener(
      'onDevicesChanged',
      refreshLogs,
    );

    return () => {
      eventListener.remove();
    };
  }, [refreshLogs]);

  return data;
};
