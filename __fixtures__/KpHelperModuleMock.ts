import {LocalHelperModule} from '../src/lib/utilities/KpHelperModule';
import * as crypto from 'crypto';
import {CryptoHashAlgorithm} from '../src/lib/crypto/CryptoHash';

const KpHelperModuleMock: Omit<LocalHelperModule, 'module'> = {
  readFile: jest.fn().mockResolvedValue([]),
  transformAesKdfKey: jest
    .fn<Promise<Uint8Array>, [Uint8Array, Uint8Array, number]>()
    .mockImplementation(async (key, seed, rounds) => {
      let result = Uint8Array.from(key);

      if (Array.isArray(seed)) {
        seed = Uint8Array.from(seed);
      }

      while (rounds--) {
        const cipher = crypto
          .createCipheriv('aes-256-ecb', seed, Buffer.alloc(0))
          .setAutoPadding(false);
        result = Buffer.concat([cipher.update(result), cipher.final()]);
      }

      return result;
    }),
  hash: jest
    .fn<Promise<Uint8Array>, [CryptoHashAlgorithm, Uint8Array[]]>()
    .mockImplementation(async (algorithm, data) => {
      const hash = crypto.createHash(
        algorithm === CryptoHashAlgorithm.Sha256 ? 'sha256' : 'sha512',
      );

      data.forEach(datum => hash.update(datum));

      return hash.digest();
    }),
  hmac: jest
    .fn<Promise<Uint8Array>, [CryptoHashAlgorithm, Uint8Array, Uint8Array[]]>()
    .mockImplementation(async (algorithm, key, data) => {
      const hmac = crypto.createHmac(
        algorithm === CryptoHashAlgorithm.Sha256 ? 'sha256' : 'sha512',
        Uint8Array.from(key),
      );

      data.forEach(datum => hmac.update(datum));

      return hmac.digest();
    }),
};

export default KpHelperModuleMock;
