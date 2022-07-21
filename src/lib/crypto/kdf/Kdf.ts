import bigInt, {BigInteger} from 'big-integer';

import {VariantFieldMap} from '../../format/Keepass2';

export default abstract class Kdf {
  private seed: Uint8Array = new Uint8Array(0);
  private rounds: BigInteger = bigInt(0);

  public static readonly KDF_MIN_SEED_SIZE = 8;
  public static readonly KDF_MAX_SEED_SIZE = 32;

  /*
   * Default target encryption time, in MS.
   */
  public static readonly DEFAULT_ENCRYPTION_TIME = 1000;

  /*
   * Minimum target encryption time, in MS.
   */
  public static readonly MIN_ENCRYPTION_TIME = 100;

  /*
   * Maximum target encryption time, in MS.
   */
  public static readonly MAX_ENCRYPTION_TIME = 5000;

  protected constructor(public readonly uuid: string) {
    //
  }

  public setSeed(seed: Uint8Array): boolean {
    if (
      seed.byteLength < Kdf.KDF_MIN_SEED_SIZE ||
      seed.byteLength > Kdf.KDF_MAX_SEED_SIZE
    ) {
      return false;
    }

    this.seed = seed;
    return true;
  }

  public getSeed(): Uint8Array {
    return this.seed;
  }

  public setRounds(rounds: number | BigInteger): boolean {
    if (typeof rounds === 'number') {
      rounds = bigInt(rounds);
    }

    if (rounds.lesser(1) || rounds.greater(Number.MAX_SAFE_INTEGER)) {
      return false;
    }

    this.rounds = rounds;
    return true;
  }

  public getRounds(): BigInteger {
    return this.rounds;
  }

  public abstract processParameters(map: VariantFieldMap): boolean;

  public abstract transform(raw: Uint8Array): Promise<Uint8Array>;
}
