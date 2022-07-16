import * as crypto from 'crypto';

export enum CryptoHashAlgorithm {
  Sha256,
  Sha512,
}

export default class CryptoHash {
  private _instance: crypto.Hash | crypto.Hmac | undefined;
  private readonly factory: () => crypto.Hash | crypto.Hmac;

  constructor(
    private readonly algo: CryptoHashAlgorithm,
    private readonly hmacKey?: crypto.BinaryLike | crypto.KeyObject | undefined,
  ) {
    switch (algo) {
      case CryptoHashAlgorithm.Sha256:
      case CryptoHashAlgorithm.Sha512: {
        const algorithm =
          algo === CryptoHashAlgorithm.Sha256 ? 'sha256' : 'sha512';
        if (hmacKey) {
          this.factory = () => crypto.createHmac(algorithm, hmacKey);
        } else {
          this.factory = () => crypto.createHash(algorithm);
        }
        break;
      }
      default:
        throw new Error(`Not implemented ${algo}`);
    }
  }

  get instance(): crypto.Hash | crypto.Hmac {
    if (this._instance === undefined) {
      this._instance = this.factory();
    }

    return this._instance;
  }

  public static hash(data: Uint8Array, algo: CryptoHashAlgorithm): Uint8Array {
    const hash = new CryptoHash(algo);
    hash.addData(data);
    return Uint8Array.from(hash.result());
  }

  public static hmac(
    data: Uint8Array,
    key: Uint8Array,
    algo: CryptoHashAlgorithm,
  ): Uint8Array {
    const hash = new CryptoHash(algo, key);
    hash.addData(data);
    return Uint8Array.from(hash.result());
  }

  public addData(data: Uint8Array): void {
    this.instance.update(data);
  }

  public result(): Uint8Array {
    return this.instance.digest();
  }
}
