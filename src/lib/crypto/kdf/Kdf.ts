import {VariantFieldMap} from '../../format/Keepass2';

export default abstract class Kdf {
  private seed: Uint8Array = new Uint8Array(0);
  private rounds: bigint = BigInt(0);

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
      seed.length < Kdf.KDF_MIN_SEED_SIZE ||
      seed.length > Kdf.KDF_MAX_SEED_SIZE
    ) {
      return false;
    }

    this.seed = seed;
    return true;
  }

  public getSeed(): Uint8Array {
    return this.seed;
  }

  public setRounds(rounds: bigint): boolean {
    if (rounds < 1 || rounds > Number.MAX_SAFE_INTEGER) {
      return false;
    }

    this.rounds = rounds;
    return true;
  }

  public getRounds(): bigint {
    return this.rounds;
  }

  public abstract processParameters(map: VariantFieldMap): boolean;

  public abstract transform(raw: Uint8Array): Uint8Array;
}
