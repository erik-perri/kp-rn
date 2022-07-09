import * as fs from 'fs';
import Kdbx4Reader from '../../../src/lib/format/Kdbx4Reader';
import PasswordKey from '../../../src/lib/keys/PasswordKey';
import CompositeKey from '../../../src/lib/keys/CompositeKey';
import {
  FILE_VERSION_4,
  FILE_VERSION_CRITICAL_MASK,
} from '../../../src/lib/format/Keepass2';
import sampleAes256AesKdfKdbx4 from '../../../__fixtures__/sample-aes256-aes-kdf-kdbx4';

describe('Kbd4Reader', () => {
  it('can open a database', async () => {
    const file = fs.readFileSync(
      '__fixtures__/sample-aes256-aes-kdf-kdbx4.kdbx',
    );

    const reader = new Kdbx4Reader();
    const database = reader.readDatabase(
      file,
      new CompositeKey([new PasswordKey('sample')]),
    );

    expect(database.getTransformedDatabaseKey()).toEqualUint8Array(
      sampleAes256AesKdfKdbx4.transformedDatabaseKey,
    );

    // eslint-disable-next-line no-bitwise
    expect(database.getFormatVersion() & FILE_VERSION_CRITICAL_MASK).toEqual(
      FILE_VERSION_4,
    );

    // expect(database.getName()).toEqual('Sample');
  });
});
