import {Key} from './Key';
import {SHA256_SIZE} from '../utilities/sizes';
import CryptoHash, {CryptoHashAlgorithm} from '../crypto/CryptoHash';

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

  load(data: Uint8Array): boolean {
    this.type = FileKeyType.None;

    if (!data.byteLength) {
      return false;
    }

    // TODO Determine type base on file structure, only falling back to hash
    //      if unknown structure.

    return this.loadHashed(data);
  }

  private loadHashed(data: Uint8Array): boolean {
    const cryptoHash = new CryptoHash(CryptoHashAlgorithm.Sha256);

    cryptoHash.addData(data);

    this.setRawKey(cryptoHash.result());
    this.type = FileKeyType.Hashed;

    return true;
  }

  getRawKey(): Uint8Array {
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
