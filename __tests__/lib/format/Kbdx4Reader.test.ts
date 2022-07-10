import * as fs from 'fs';
import Kdbx4Reader from '../../../src/lib/format/Kdbx4Reader';
import PasswordKey from '../../../src/lib/keys/PasswordKey';
import CompositeKey from '../../../src/lib/keys/CompositeKey';
import FileKey from '../../../src/lib/keys/FileKey';

describe('Kbd4Reader', () => {
  it('can read a database', async () => {
    const databaseFile = fs.readFileSync(
      '__fixtures__/sample-aes256-aes-kdf-kdbx4.kdbx',
    );

    const reader = new Kdbx4Reader();
    const database = await reader.readDatabase(
      databaseFile,
      new CompositeKey([new PasswordKey('sample')]),
    );

    expect(database.metadata.generator).toEqual('KeePassXC');
    expect(database.metadata.databaseName).toEqual('Sample');
  });

  it('can read a database using a file key', async () => {
    const databaseFile = fs.readFileSync(
      '__fixtures__/sample-aes256-aes-kdf-with-key-kdbx4.kdbx',
    );
    const databaseKey = fs.readFileSync('__fixtures__/sample.key');
    const key = new FileKey();
    key.load(databaseKey);

    const reader = new Kdbx4Reader();
    const database = await reader.readDatabase(
      databaseFile,
      new CompositeKey([new PasswordKey('sample'), key]),
    );

    expect(database.metadata.generator).toEqual('KeePassXC');
    expect(database.metadata.databaseName).toEqual('Sample');
  });
});
