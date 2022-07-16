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

    const password = new PasswordKey();
    await password.setPassword('sample');

    const reader = new Kdbx4Reader();
    const database = await reader.readDatabase(
      databaseFile,
      new CompositeKey([password]),
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

    expect(await key.load(databaseKey)).toEqual(true);
    expect(await key.getRawKey()).toEqualUint8Array(
      Uint8Array.from([
        0x96, 0xca, 0xca, 0x11, 0xa1, 0x9b, 0xa6, 0x49, 0xf1, 0xb, 0x34, 0x58,
        0xd3, 0xa6, 0x7f, 0x39, 0x8c, 0x57, 0x7e, 0x6, 0x27, 0xb4, 0x5c, 0x86,
        0x91, 0xf9, 0xc0, 0x59, 0x41, 0xcf, 0x5a, 0x90,
      ]),
    );

    const password = new PasswordKey();
    await password.setPassword('sample');

    const reader = new Kdbx4Reader();
    const database = await reader.readDatabase(
      databaseFile,
      new CompositeKey([password, key]),
    );

    expect(database.metadata.generator).toEqual('KeePassXC');
    expect(database.metadata.databaseName).toEqual('Sample');
  });
});
