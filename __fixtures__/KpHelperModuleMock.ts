import {LocalHelperModule} from '../src/lib/utilities/KpHelperModule';
import * as crypto from 'crypto';
import {CryptoHashAlgorithm} from '../src/lib/crypto/CryptoHash';
import {
  Cipher,
  SymmetricCipherDirection,
  SymmetricCipherMode,
} from '../src/lib/crypto/SymmetricCipher';
import {Chacha20} from 'ts-chacha20';

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
  cipher: jest
    .fn<
      Promise<Uint8Array>,
      [
        SymmetricCipherMode,
        SymmetricCipherDirection,
        Uint8Array,
        Uint8Array,
        Uint8Array,
      ]
    >()
    .mockImplementation(async (mode, direction, key, iv, data) => {
      const cipher = crypto
        .createDecipheriv('aes-256-cbc', key, iv)
        .setAutoPadding(true);

      return Uint8Array.from([...cipher.update(data), ...cipher.final()]);
    }),
  createCipher: jest
    .fn<
      Promise<Cipher>,
      [SymmetricCipherMode, SymmetricCipherDirection, Uint8Array, Uint8Array]
    >()
    .mockImplementation(async (mode, direction, key, iv): Promise<Cipher> => {
      if (mode === SymmetricCipherMode.ChaCha20) {
        let cipher: Chacha20 | undefined = new Chacha20(key, iv);

        return {
          finish: async data => {
            const result =
              direction === SymmetricCipherDirection.Encrypt
                ? cipher?.encrypt(data)
                : cipher?.decrypt(data);
            cipher = undefined;
            return result ?? Uint8Array.from([]);
          },
          process: async data => {
            return (
              (direction === SymmetricCipherDirection.Encrypt
                ? cipher?.encrypt(data)
                : cipher?.decrypt(data)) ?? Uint8Array.from([])
            );
          },
          destroy: async () => {},
        };
      }

      const cipher = crypto
        .createDecipheriv('aes-256-cbc', key, iv)
        .setAutoPadding(true);

      return {
        process: async data => {
          return Uint8Array.from(cipher.update(data));
        },
        finish: async data => {
          return Uint8Array.from([...cipher.update(data), ...cipher.final()]);
        },
        destroy: async () => {},
      };
    }),
};

export default KpHelperModuleMock;
