import * as fs from 'fs';

import Kdbx4Reader from '../../../src/lib/format/Kdbx4Reader';
import CompositeKey from '../../../src/lib/keys/CompositeKey';
import FileKey from '../../../src/lib/keys/FileKey';
import PasswordKey from '../../../src/lib/keys/PasswordKey';

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
    expect(database.metadata.name).toEqual('Sample');
    expect(database.metadata.historyMaxItems).toEqual(10);
    expect(database.metadata.historyMaxSize).toEqual(6 * 1024 * 1024);
    expect(database.metadata.recycleBinUuid).toEqual(
      '27cba30e-e92e-45ab-98db-48a63f389e8b',
    );

    expect(database.rootGroup?.entries?.[0]?.attributes.Password).toEqual(
      'password',
    );
    expect(
      database.rootGroup?.entries?.[0]?.attributes['Protected Attribute'],
    ).toEqual('Protected');

    // Since the recycle group should be at the end this will check that the
    // entries were decrypted in the correct stream order.
    const childrenCount = database.rootGroup?.children.length ?? 0;
    expect(
      database.rootGroup?.children?.[childrenCount - 1]?.entries?.[0]
        ?.attributes.Password,
    ).toEqual('deleted');
  });
});
