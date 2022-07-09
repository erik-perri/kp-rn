import CryptoHash, {CryptoHashAlgorithm} from '../crypto/CryptoHash';

export const UINT64_MAX = BigInt('0xffffffffffffffff');

export function getHmacKey(blockIndex: bigint, key: Uint8Array): Uint8Array {
  if (key.byteLength !== 64) {
    throw new Error('Unexpected key length');
  }

  const indexBytes = new ArrayBuffer(8);
  new DataView(indexBytes).setBigUint64(0, blockIndex, true);

  const hash = new CryptoHash(CryptoHashAlgorithm.Sha512);
  hash.addData(new Uint8Array(indexBytes));
  hash.addData(key);
  return hash.result();
}
