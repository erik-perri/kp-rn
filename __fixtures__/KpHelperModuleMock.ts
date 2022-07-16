import {HelperModule} from '../src/lib/utilities/KpHelperModule';
import * as crypto from 'crypto';

const KpHelperModuleMock: HelperModule = {
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
};

export default KpHelperModuleMock;
