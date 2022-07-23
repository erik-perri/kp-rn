import * as crypto from 'crypto';
import {Chacha20} from 'ts-chacha20';

import {CryptoHashAlgorithm} from '../src/lib/crypto/CryptoHash';
import {
  Cipher,
  SymmetricCipherDirection,
  SymmetricCipherMode,
} from '../src/lib/crypto/SymmetricCipher';
import {LocalHelperModule} from '../src/lib/utilities/KpHelperModule';
import Uint8ArrayReader from '../src/lib/utilities/Uint8ArrayReader';

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
  transformArgon2KdfKey: jest.fn().mockImplementation(() => {
    throw new Error('Not implemented');
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
      switch (mode) {
        case SymmetricCipherMode.ChaCha20: {
          let cipher: Chacha20 | undefined = new Chacha20(key, iv);

          return {
            finish: async data => {
              if (!cipher) {
                throw new Error();
              }
              if (!data.byteLength) {
                return new Uint8Array(0);
              }
              return direction === SymmetricCipherDirection.Encrypt
                ? cipher.encrypt(data)
                : cipher.decrypt(data);
            },
            process: async data => {
              if (!cipher) {
                throw new Error();
              }
              return direction === SymmetricCipherDirection.Encrypt
                ? cipher.encrypt(data)
                : cipher.decrypt(data);
            },
            destroy: async () => {
              if (!cipher) {
                throw new Error();
              }
              cipher = undefined;
            },
          };
        }
        case SymmetricCipherMode.Aes256_CBC: {
          let cipher: crypto.Decipher | undefined = crypto
            .createDecipheriv('aes-256-cbc', key, iv)
            .setAutoPadding(true);

          return {
            process: async data => {
              if (!cipher) {
                throw new Error();
              }
              return Uint8Array.from(cipher.update(data));
            },
            finish: async data => {
              if (!cipher) {
                throw new Error();
              }
              return Uint8Array.from([
                ...cipher.update(data),
                ...cipher.final(),
              ]);
            },
            destroy: async () => {
              if (!cipher) {
                throw new Error();
              }
              cipher = undefined;
            },
          };
        }
        default:
          throw new Error(
            `Cipher ${SymmetricCipherMode[mode]} (${mode}) not mocked`,
          );
      }
    }),
  challengeResponse: jest
    .fn<Promise<Uint8Array>, [string, Uint8Array]>()
    .mockImplementation(async (_uuid, data) => {
      const mockResponses = [
        {
          challenge: Uint8Array.from([
            0xf0, 0x98, 0x38, 0x6a, 0x09, 0x55, 0xb4, 0x64, 0x47, 0x9d, 0x29,
            0x53, 0x5c, 0x28, 0x03, 0xb7, 0xe8, 0x71, 0x31, 0x0d, 0x47, 0xf9,
            0x41, 0x11, 0xf5, 0x2f, 0x18, 0x88, 0xd4, 0xad, 0x7a, 0xe9,
          ]),
          response: Uint8Array.from([
            0xe4, 0xe1, 0x57, 0x99, 0xd3, 0x17, 0xa9, 0xdf, 0xe7, 0xc8, 0x18,
            0x34, 0x3d, 0x64, 0x07, 0x73, 0xac, 0xc0, 0xda, 0x9e,
          ]),
        },
      ];

      for (const {challenge, response} of mockResponses) {
        if (Uint8ArrayReader.equals(data, challenge)) {
          return response;
        }
      }

      throw new Error('Not implemented');
    }),
};

export default KpHelperModuleMock;
