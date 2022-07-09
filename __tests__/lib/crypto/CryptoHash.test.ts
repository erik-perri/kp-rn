import CryptoHash, {
  CryptoHashAlgorithm,
} from '../../../src/lib/crypto/CryptoHash';
import sampleAes256AesKdfKdbx4 from '../../../__fixtures__/sample-aes256-aes-kdf-kdbx4';
import {getHmacKey, UINT64_MAX} from '../../../src/lib/streams/HmacBlockStream';

describe('CryptoHash', () => {
  describe('hmac', () => {
    it('hashes as expected', () => {
      const result = CryptoHash.hmac(
        sampleAes256AesKdfKdbx4.headerData,
        getHmacKey(UINT64_MAX, sampleAes256AesKdfKdbx4.hmacKey),
        CryptoHashAlgorithm.Sha256,
      );

      expect(result).toEqualUint8Array(sampleAes256AesKdfKdbx4.headerHmacHash);
    });
  });
});
