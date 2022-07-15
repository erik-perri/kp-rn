import Kdf from './Kdf';
import * as crypto from 'crypto';
import {
  KDF_AES_KDBX3,
  KDF_AES_KDBX4,
  KDFPARAM_AES_ROUNDS,
  KDFPARAM_AES_SEED,
  VariantFieldMap,
} from '../../format/Keepass2';
import CryptoHash, {CryptoHashAlgorithm} from '../CryptoHash';

export default class AesKdf extends Kdf {
  constructor(private legacyKdbx3: boolean = false) {
    super(legacyKdbx3 ? KDF_AES_KDBX3 : KDF_AES_KDBX4);
  }

  processParameters(map: VariantFieldMap): boolean {
    const rounds = map[KDFPARAM_AES_ROUNDS];
    if (typeof rounds !== 'bigint' || !this.setRounds(rounds)) {
      return false;
    }

    const seed = map[KDFPARAM_AES_SEED];
    return seed instanceof Uint8Array && this.setSeed(seed);
  }

  async transform(raw: Uint8Array): Promise<Uint8Array> {
    return await this.transformKeyRaw(raw, this.getSeed(), this.getRounds());
  }

  private async transformKeyRaw(
    key: Uint8Array,
    seed: Uint8Array,
    rounds: bigint,
  ): Promise<Uint8Array> {
    let result = new Uint8Array(key);

    while (rounds--) {
      const cipher = crypto
        .createCipheriv('aes-256-ecb', seed, Buffer.alloc(0))
        .setAutoPadding(false);
      result = Buffer.concat([cipher.update(result), cipher.final()]);
    }

    return Promise.resolve(CryptoHash.hash(result, CryptoHashAlgorithm.Sha256));
  }
}
