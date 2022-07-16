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

  async getRawKey(transformSeed?: Uint8Array): Promise<Uint8Array> {
    const hashData: Uint8Array[] = await Promise.all(
      this.keys.map(key => key.getRawKey()),
    );

    if (transformSeed) {
      const challengeResult = this.challenge(transformSeed);

      hashData.push(challengeResult);
    }

    return await CryptoHash.hash(hashData, CryptoHashAlgorithm.Sha256);
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

  async transform(kdf: Kdf): Promise<Uint8Array> {
    if (kdf.uuid === KDF_AES_KDBX3) {
      // legacy KDBX3 AES-KDF, challenge response is added later to the hash
      return await kdf.transform(await this.getRawKey());
    }

    const seed = kdf.getSeed();
    if (!seed.byteLength) {
      throw new Error('Seed empty');
    }

    const rawKey = await this.getRawKey(seed);

    return await kdf.transform(rawKey);
  }
}
