import {NativeHelperModule} from '../src/lib/utilities/KpHelperModule';
import * as crypto from 'crypto';
import {CryptoHashAlgorithm} from '../src/lib/crypto/CryptoHash';

const KpHelperModuleMock: NativeHelperModule = {
  readFile: jest.fn().mockResolvedValue([]),
  transformAesKdfKey: jest
    .fn<
      Promise<number[]>,
      [Uint8Array | number[], Uint8Array | number[], number]
    >()
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

      return Promise.resolve([...result.values()]);
    }),
  createHash: jest
    .fn<Promise<number[]>, [number[][], CryptoHashAlgorithm]>()
    .mockImplementation(async (data, algorithm) => {
      const hash = crypto.createHash(
        algorithm === CryptoHashAlgorithm.Sha256 ? 'sha256' : 'sha512',
      );

      data.forEach(datum => hash.update(Uint8Array.from(datum)));

      return [...hash.digest().values()];
    }),
  createHmac: jest
    .fn<Promise<number[]>, [number[], number[][], CryptoHashAlgorithm]>()
    .mockImplementation(async (key, data, algorithm) => {
      const hmac = crypto.createHmac(
        algorithm === CryptoHashAlgorithm.Sha256 ? 'sha256' : 'sha512',
        Uint8Array.from(key),
      );

      data.forEach(datum => hmac.update(Uint8Array.from(datum)));

      return [...hmac.digest().values()];
    }),
};

export default KpHelperModuleMock;
