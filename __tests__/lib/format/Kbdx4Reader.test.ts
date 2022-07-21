import * as fs from 'fs';
import Kdbx4Reader from '../../../src/lib/format/Kdbx4Reader';
import PasswordKey from '../../../src/lib/keys/PasswordKey';
import CompositeKey from '../../../src/lib/keys/CompositeKey';
import FileKey from '../../../src/lib/keys/FileKey';

describe('Kbd4Reader', () => {
  it.each([
    {
      file: '__fixtures__/sample-aes256-aes-kdf-kdbx4.kdbx',
      keyFactory: async () => {
        const password = new PasswordKey();
        await password.setPassword('sample');
        return [password];
      },
    },
    {
      file: '__fixtures__/sample-aes256-chacha20-kdf-kdbx4.kdbx',
      keyFactory: async () => {
        const password = new PasswordKey();
        await password.setPassword('sample');
        return [password];
      },
    },
    {
      file: '__fixtures__/sample-aes256-aes-kdf-with-key-kdbx4.kdbx',
      keyFactory: async () => {
        const databaseKey = fs.readFileSync('__fixtures__/sample.key');
        const key = new FileKey();

        await key.load(databaseKey);

        const password = new PasswordKey();
        await password.setPassword('sample');

        return [password, key];
      },
    },
  ])('can read a database %s', async ({file, keyFactory}) => {
    const databaseFile = fs.readFileSync(file);

    const keys = await keyFactory();
    const reader = new Kdbx4Reader();
    const database = await reader.readDatabase(
      databaseFile,
      new CompositeKey(keys),
    );

    expect(database.metadata.generator).toEqual('KeePassXC');
    expect(database.metadata.databaseName).toEqual('Sample');
    expect(database.rootGroup?.entries?.[0]?.attributes?.Password).toEqual(
      'password',
    );
    expect(
      database.rootGroup?.entries?.[0]?.attributes?.['Protected Attribute'],
    ).toEqual('Protected');
    expect(database.rootGroup?.entries?.[0]?.protectedAttributes).toEqual([
      'Password',
      'Protected Attribute',
    ]);
  });
});
