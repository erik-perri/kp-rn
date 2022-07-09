import CryptoHash, {
  CryptoHashAlgorithm,
} from '../../../src/lib/crypto/CryptoHash';
import sampleAes256AesKdfKdbx4 from '../../../__fixtures__/sample-aes256-aes-kdf-kdbx4';
import HmacBlockStream, {
  UINT64_MAX,
} from '../../../src/lib/streams/HmacBlockStream';

describe('CryptoHash', () => {
  it('hmac hashes as expected', () => {
    const result = CryptoHash.hmac(
      sampleAes256AesKdfKdbx4.headerData,
      HmacBlockStream.getHmacKey(UINT64_MAX, sampleAes256AesKdfKdbx4.hmacKey),
      CryptoHashAlgorithm.Sha256,
    );

    expect(result).toEqualUint8Array(sampleAes256AesKdfKdbx4.headerHmacHash);
  });
});
