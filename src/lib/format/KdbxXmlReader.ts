import {parseStringPromise} from 'xml2js';
import {Database} from '../core/Database';
import {FILE_VERSION_4} from './Keepass2';
import Kdbx4XmlReader from './Kdbx4XmlReader';
import {Cipher} from '../crypto/SymmetricCipher';

export default class KdbxXmlReader {
  constructor(
    private readonly version: number,
    private readonly binaryPool: Record<string, Uint8Array>,
  ) {
    if (version !== FILE_VERSION_4) {
      throw new Error('Unsupported file version');
    }
  }

  async readDatabase(
    data: Uint8Array,
    database: Database,
    randomStream: Cipher,
  ): Promise<void> {
    const parsedXml = await parseStringPromise(String.fromCharCode(...data), {
      emptyTag: undefined,
    });

    const parser = new Kdbx4XmlReader();
    const parsedJson = await parser.decodeFile(parsedXml, randomStream);

    database.metadata.generator = parsedJson.KeePassFile.Meta[0].Generator[0];
    database.metadata.databaseName =
      parsedJson.KeePassFile.Meta[0].DatabaseName[0];
  }
}
