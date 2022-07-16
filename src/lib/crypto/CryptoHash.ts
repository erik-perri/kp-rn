import KpHelperModule from '../utilities/KpHelperModule';

export enum CryptoHashAlgorithm {
  Sha256,
  Sha512,
}

export default class CryptoHash {
  public static async hash(
    data: Uint8Array | Uint8Array[],
    algo: CryptoHashAlgorithm,
  ): Promise<Uint8Array> {
    if (!Array.isArray(data)) {
      data = [data];
    }

    return await KpHelperModule.hash(algo, data);
  }

  public static async hmac(
    data: Uint8Array | Uint8Array[],
    key: Uint8Array,
    algo: CryptoHashAlgorithm,
  ): Promise<Uint8Array> {
    if (!Array.isArray(data)) {
      data = [data];
    }

    return await KpHelperModule.hmac(algo, key, data);
  }
}
