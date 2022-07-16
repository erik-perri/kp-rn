import {Key} from './Key';
import CryptoHash, {CryptoHashAlgorithm} from '../crypto/CryptoHash';
import {SHA256_SIZE} from '../utilities/sizes';
import Uint8ArrayWriter from '../utilities/Uint8ArrayWriter';

export default class PasswordKey extends Key {
  public static readonly UUID = '77e90411-303a-43f2-b773-853b05635ead';
  private rawKey: Uint8Array | undefined;

  constructor() {
    super(PasswordKey.UUID);
  }

  async setPassword(password: string) {
    this.setRawKey(
      await CryptoHash.hash(
        Uint8ArrayWriter.fromString(password),
        CryptoHashAlgorithm.Sha256,
      ),
    );
  }

  async getRawKey(): Promise<Uint8Array> {
    return this.rawKey ?? new Uint8Array(0);
  }

  setRawKey(data: Uint8Array): void {
    if (data.byteLength !== SHA256_SIZE) {
      throw new Error('Invalid key length');
    }
    this.rawKey = Uint8Array.from(data);
  }

  deserialize(_data: Uint8Array): void {
    throw new Error('Not implemented');
  }

  serialize(): Uint8Array {
    throw new Error('Not implemented');
  }
}
