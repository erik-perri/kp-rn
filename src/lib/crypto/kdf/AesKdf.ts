import Kdf from './Kdf';
import {
  KDF_AES_KDBX3,
  KDF_AES_KDBX4,
  KDFPARAM_AES_ROUNDS,
  KDFPARAM_AES_SEED,
  VariantFieldMap,
} from '../../format/Keepass2';
import CryptoHash, {CryptoHashAlgorithm} from '../CryptoHash';
import KpHelperModule from '../../utilities/KpHelperModule';

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
    const rounds = Number(this.getRounds());
    if (rounds < this.getRounds()) {
      throw new Error('Rounds too high');
    }

    return await AesKdf.transformKeyRaw(raw, this.getSeed(), rounds);
  }

  private static async transformKeyRaw(
    key: Uint8Array,
    seed: Uint8Array,
    rounds: number,
  ): Promise<Uint8Array> {
    const result = await KpHelperModule.transformAesKdfKey(key, seed, rounds);
    return CryptoHash.hash(Uint8Array.from(result), CryptoHashAlgorithm.Sha256);
  }
}
