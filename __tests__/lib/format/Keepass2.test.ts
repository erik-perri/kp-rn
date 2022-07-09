import {hmacKey} from '../../../src/lib/format/Keepass2';
import sampleAes256AesKdfKdbx4 from '../../../__fixtures__/sample-aes256-aes-kdf-kdbx4';

describe('Keepass2', () => {
  it('hmacKey works as expected', async () => {
    const result = hmacKey(
      sampleAes256AesKdfKdbx4.masterSeed,
      sampleAes256AesKdfKdbx4.transformedDatabaseKey,
    );

    expect(result).toEqualUint8Array(sampleAes256AesKdfKdbx4.hmacKey);
  });
});
