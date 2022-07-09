import CryptoHash, {CryptoHashAlgorithm} from '../crypto/CryptoHash';

export const UINT64_MAX = BigInt('0xffffffffffffffff');

export default class HmacBlockStream {
  public static getHmacKey(blockIndex: bigint, key: Uint8Array): Uint8Array {
    if (key.byteLength !== 64) {
      throw new Error('Unexpected key length');
    }

    const hash = new CryptoHash(CryptoHashAlgorithm.Sha512);
    hash.addData(makeUint8ArrayFromUint64(blockIndex));
    hash.addData(key);
    return hash.result();
  }
}
