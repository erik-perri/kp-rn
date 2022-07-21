import CryptoHash, {CryptoHashAlgorithm} from '../crypto/CryptoHash';
import {SHA256_SIZE} from '../utilities/sizes';
import {Key} from './Key';

enum FileKeyType {
  None,
  Hashed,
  KeePass2XML,
  KeePass2XMLv2,
  FixedBinary,
  FixedBinaryHex,
}

export default class FileKey extends Key {
  public static readonly UUID = 'a584cbc4-c9b4-437e-81bb-362ca9709273';
  private rawKey: Uint8Array | undefined;
  private type: FileKeyType = FileKeyType.None;

  constructor() {
    super(FileKey.UUID);
  }

  async load(data: Uint8Array): Promise<boolean> {
    this.type = FileKeyType.None;

    if (!data.byteLength) {
      return false;
    }

    // TODO Determine type base on file structure, only falling back to hash
    //      if unknown structure.

    return await this.loadHashed(data);
  }

  private async loadHashed(data: Uint8Array): Promise<boolean> {
    const hashed = await CryptoHash.hash([data], CryptoHashAlgorithm.Sha256);

    this.setRawKey(hashed);
    this.type = FileKeyType.Hashed;

    return true;
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
