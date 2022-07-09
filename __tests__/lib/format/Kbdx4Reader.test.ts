import * as fs from 'fs';
import Kdbx4Reader from '../../../src/lib/format/Kdbx4Reader';
import PasswordKey from '../../../src/lib/keys/PasswordKey';
import CompositeKey from '../../../src/lib/keys/CompositeKey';

describe('Kbd4Reader', () => {
  it('can read a database', async () => {
    const file = fs.readFileSync(
      '__fixtures__/sample-aes256-aes-kdf-kdbx4.kdbx',
    );

    const reader = new Kdbx4Reader();
    const database = await reader.readDatabase(
      file,
      new CompositeKey([new PasswordKey('sample')]),
    );

    expect(database.metadata.generator).toEqual('KeePassXC');
    expect(database.metadata.databaseName).toEqual('Sample');
  });
});
