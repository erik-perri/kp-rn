import bigInt, {BigInteger} from 'big-integer';

import {
  KDF_ARGON2D,
  KDF_ARGON2ID,
  KDFPARAM_ARGON2_ITERATIONS,
  KDFPARAM_ARGON2_MEMORY,
  KDFPARAM_ARGON2_PARALLELISM,
  KDFPARAM_ARGON2_SALT,
  KDFPARAM_ARGON2_VERSION,
  VariantFieldMap,
} from '../../format/Keepass2';
import KpHelperModule from '../../utilities/KpHelperModule';
import Kdf from './Kdf';

export enum Argon2Version {
  V10 = 0x10,
  V13 = 0x13,
}

export enum Argon2Type {
  Argon2d = 0,
  Argon2id = 1,
}

function isBigInteger(value: unknown): value is BigInteger {
  return typeof (value as BigInteger)?.toJSNumber === 'function';
}

export default class Argon2Kdf extends Kdf {
  private version: Argon2Version = Argon2Version.V10;
  private parallelism: number = 0;
  private memory: BigInteger = bigInt(0);

  constructor(private type: Argon2Type) {
    super(type === Argon2Type.Argon2d ? KDF_ARGON2D : KDF_ARGON2ID);
  }

  processParameters(map: VariantFieldMap): boolean {
    const salt = map[KDFPARAM_ARGON2_SALT];
    if (!(salt instanceof Uint8Array) || !this.setSeed(salt)) {
      return false;
    }

    const version = map[KDFPARAM_ARGON2_VERSION];
    if (typeof version !== 'number' || !this.setVersion(version)) {
      return false;
    }

    const lanes = map[KDFPARAM_ARGON2_PARALLELISM];
    if (typeof lanes !== 'number' || !this.setParallelism(lanes)) {
      return false;
    }

    const memory = map[KDFPARAM_ARGON2_MEMORY];
    if (!isBigInteger(memory) || !this.setMemory(memory.divide(1024))) {
      return false;
    }

    const iterations = map[KDFPARAM_ARGON2_ITERATIONS];
    if (!isBigInteger(iterations) || !this.setRounds(iterations)) {
      return false;
    }

    // Comment to stop Webstorm from suggesting we merge the return.

    return true;
  }

  public setVersion(version: number): boolean {
    if (version >= Argon2Version.V10 && version <= Argon2Version.V13) {
      this.version = version;
      return true;
    }

    this.version = Argon2Version.V13;
    return false;
  }

  private setParallelism(threads: number) {
    // MIN=1; MAX=16,777,215
    // eslint-disable-next-line no-bitwise
    if (threads >= 1 && threads < 1 << 24) {
      this.parallelism = threads;
      return true;
    }

    this.parallelism = 1;
    return false;
  }

  private setMemory(kibibytes: BigInteger) {
    // MIN=8KB; MAX=2,147,483,648KB
    if (
      kibibytes.greaterOrEquals(8) &&
      kibibytes.lesser(bigInt(1).shiftLeft(32))
    ) {
      this.memory = kibibytes;
      return true;
    }

    this.memory = bigInt(16);
    return false;
  }

  async transform(raw: Uint8Array): Promise<Uint8Array> {
    const rounds = this.getRounds();
    const roundsAsNumber = rounds.toJSNumber();
    if (rounds.greater(roundsAsNumber)) {
      throw new Error('Rounds too high');
    }

    const memory = this.memory;
    const memoryAsNumber = memory.toJSNumber();
    if (memory.greater(memoryAsNumber)) {
      throw new Error('Memory too high');
    }

    return await KpHelperModule.transformArgon2KdfKey(
      raw,
      this.getSeed(),
      this.version,
      this.type,
      memoryAsNumber,
      this.parallelism,
      roundsAsNumber,
    );
  }
}
