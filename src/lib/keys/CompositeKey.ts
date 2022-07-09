import {Key} from './Key';
import Kdf from '../crypto/kdf/Kdf';
import {KDF_AES_KDBX3} from '../format/Keepass2';
import CryptoHash, {CryptoHashAlgorithm} from '../crypto/CryptoHash';

export default class CompositeKey extends Key {
  public static readonly UUID = '76a7ae25-a542-4add-9849-7c06be945b94';

  constructor(private keys: Key[] = []) {
    super(CompositeKey.UUID);
  }

  get isEmpty() {
    return this.keys.length > 0;
  }

  getRawKey(transformSeed?: Uint8Array): Uint8Array {
    const hash = new CryptoHash(CryptoHashAlgorithm.Sha256);

    for (const key of this.keys) {
      hash.addData(key.getRawKey());
    }

    if (transformSeed) {
      const challengeResult = this.challenge(transformSeed);

      hash.addData(challengeResult);
    }

    return hash.result();
  }

  setRawKey(data: Uint8Array): void {
    this.deserialize(data);
  }

  deserialize(_data: Uint8Array): void {
    throw new Error('Not implemented');
  }

  serialize(): Uint8Array {
    throw new Error('Not implemented');
  }

  private challenge(_seed: Uint8Array): Uint8Array {
    return new Uint8Array(0);
  }

  transform(kdf: Kdf): Uint8Array {
    if (kdf.uuid === KDF_AES_KDBX3) {
      // legacy KDBX3 AES-KDF, challenge response is added later to the hash
      return kdf.transform(this.getRawKey());
    }

    const seed = kdf.getSeed();
    if (!seed.byteLength) {
      throw new Error('Seed empty');
    }

    return kdf.transform(this.getRawKey(seed));
  }
}
