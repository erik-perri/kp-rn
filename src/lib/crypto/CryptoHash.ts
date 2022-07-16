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

    return Uint8Array.from(await KpHelperModule.createHash(data, algo));
  }

  public static async hmac(
    data: Uint8Array | Uint8Array[],
    key: Uint8Array,
    algo: CryptoHashAlgorithm,
  ): Promise<Uint8Array> {
    if (!Array.isArray(data)) {
      data = [data];
    }
    const hmac = await KpHelperModule.createHmac(key, data, algo);
    if (!hmac) {
      throw new Error('Failed to create Hmac');
    }
    return Uint8Array.from(hmac);
  }
}
