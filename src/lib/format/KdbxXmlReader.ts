import {XMLParser} from 'fast-xml-parser';
import {Database} from '../core/Database';

interface KeePassFile {
  KeePassFile: {
    Meta: {
      Generator: string;
      DatabaseName: string;
    };
  };
}

function isKeePassFile(parsed: unknown): parsed is KeePassFile {
  const parsedAsKPFile = parsed as KeePassFile;

  return typeof parsedAsKPFile?.KeePassFile?.Meta?.DatabaseName === 'string';
}

export default class KdbxXmlReader {
  constructor(
    private readonly version: number,
    private readonly binaryPool: Record<string, Uint8Array>,
  ) {
    //
  }

  async readDatabase(data: Uint8Array, database: Database): Promise<void> {
    const parser = new XMLParser();
    const parsed = parser.parse(String.fromCharCode(...data));
    if (!isKeePassFile(parsed)) {
      throw new Error('Unknown file format');
    }

    database.metadata.generator = parsed.KeePassFile.Meta.Generator;
    database.metadata.databaseName = parsed.KeePassFile.Meta.DatabaseName;
  }
}
