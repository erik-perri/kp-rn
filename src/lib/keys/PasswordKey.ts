import {Key} from './Key';
import CryptoHash, {CryptoHashAlgorithm} from '../crypto/CryptoHash';

const SHA256_SIZE = 32;

export default class PasswordKey extends Key {
  public static readonly UUID = '77e90411-303a-43f2-b773-853b05635ead';

  private rawKey: Uint8Array | undefined;

  constructor(private readonly password: string) {
    super(PasswordKey.UUID);

    this.setPassword(password);
  }

  getRawKey(): Uint8Array {
    return this.rawKey ?? new Uint8Array(0);
  }

  setRawKey(data: Uint8Array): void {
    if (data.length < 1) {
      this.rawKey = undefined;
    } else {
      if (data.length !== SHA256_SIZE) {
        throw new Error('Invalid key length');
      }
      this.rawKey = new Uint8Array(data);
    }
  }

  deserialize(_data: Uint8Array): void {
    throw new Error('Not implemented');
  }

  serialize(): Uint8Array {
    throw new Error('Not implemented');
  }

  private setPassword(password: string) {
    this.setRawKey(
      CryptoHash.hash(
        new Buffer(password, 'utf-8'),
        CryptoHashAlgorithm.Sha256,
      ),
    );
  }
}
