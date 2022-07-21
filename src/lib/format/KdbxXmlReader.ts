import {Database} from '../core/Database';
import {FILE_VERSION_4} from './Keepass2';
import {Cipher} from '../crypto/SymmetricCipher';
import Uint8ArrayWriter from '../utilities/Uint8ArrayWriter';
import {XmlElement, XmlReader} from '../utilities/XmlReader';
import {stringify as uuidStringify} from 'uuid';
import Group from '../core/Group';
import Entry from '../core/Entry';
import {Uuid} from '../core/types';

export default class KdbxXmlReader {
  constructor(
    private readonly version: number,
    private readonly binaryPool: Record<string, Uint8Array>,
    private readonly randomStream: Cipher,
  ) {
    if (version !== FILE_VERSION_4) {
      throw new Error('Unsupported file version');
    }
  }

  async readDatabase(data: Uint8Array, database: Database): Promise<void> {
    const dataAsString = String.fromCharCode(...data);
    const reader = new XmlReader(dataAsString);

    if (!reader.current().isMeta) {
      throw new Error('Unexpected database format, no XML header');
    }

    // Skip past the XML header
    reader.readNextStartElement();

    await this.parseKeePassFile(reader, database);
  }

  private async parseKeePassFile(reader: XmlReader, database: Database) {
    if (!reader.current().isOpen || reader.current().name !== 'KeePassFile') {
      throw new Error(
        `Expected "KeePassFile", found "${reader.current().name}"`,
      );
    }

    let rootElementFound = false;

    while (reader.readNextStartElement()) {
      const current = reader.current();

      switch (current.name) {
        case 'Meta':
          await this.parseMeta(reader.readFromCurrent(), database);
          break;
        case 'Root':
          if (rootElementFound) {
            throw new Error('Multiple Root elements');
          }

          await this.parseRoot(reader.readFromCurrent(), database);
          rootElementFound = true;
          break;
      }

      reader.skipCurrentElement();
    }
  }

  private async parseMeta(reader: XmlReader, database: Database) {
    if (!reader.current().isOpen || reader.current().name !== 'Meta') {
      throw new Error(`Expected "Meta", found "${reader.current().name}"`);
    }

    while (reader.readNextStartElement()) {
      const current = reader.current();

      switch (current.name) {
        case 'Generator':
          database.metadata.generator = KdbxXmlReader.readString(reader);
          break;
        case 'HeaderHash':
          database.metadata.headerHash = await this.readBinary(reader);
          break;
        case 'DatabaseName':
          database.metadata.databaseName = KdbxXmlReader.readString(reader);
          break;
        case 'DatabaseNameChanged':
          // m_meta->setNameChanged(readDateTime());
          break;
        case 'DatabaseDescription':
          database.metadata.description = KdbxXmlReader.readString(reader);
          break;
        case 'DatabaseDescriptionChanged':
          // m_meta->setDescriptionChanged(readDateTime());
          break;
        case 'DefaultUserName':
          // m_meta->setDefaultUserName(readString());
          break;
        case 'DefaultUserNameChanged':
          // m_meta->setDefaultUserNameChanged(readDateTime());
          break;
        case 'MaintenanceHistoryDays':
          // m_meta->setMaintenanceHistoryDays(readNumber());
          break;
        case 'Color':
          // m_meta->setColor(readColor());
          break;
        case 'MasterKeyChanged':
          // m_meta->setDatabaseKeyChanged(readDateTime());
          break;
        case 'MasterKeyChangeRec':
          // m_meta->setMasterKeyChangeRec(readNumber());
          break;
        case 'MasterKeyChangeForce':
          // m_meta->setMasterKeyChangeForce(readNumber());
          break;
        case 'MemoryProtection':
          // parseMemoryProtection();
          break;
        case 'CustomIcons':
          // parseCustomIcons();
          break;
        case 'RecycleBinEnabled':
          // m_meta->setRecycleBinEnabled(readBool());
          break;
        case 'RecycleBinUUID':
          // m_meta->setRecycleBin(getGroup(readUuid()));
          break;
        case 'RecycleBinChanged':
          // m_meta->setRecycleBinChanged(readDateTime());
          break;
        case 'EntryTemplatesGroup':
          // m_meta->setEntryTemplatesGroup(getGroup(readUuid()));
          break;
        case 'EntryTemplatesGroupChanged':
          // m_meta->setEntryTemplatesGroupChanged(readDateTime());
          break;
        case 'LastSelectedGroup':
          // m_meta->setLastSelectedGroup(getGroup(readUuid()));
          break;
        case 'LastTopVisibleGroup':
          // m_meta->setLastTopVisibleGroup(getGroup(readUuid()));
          break;
        case 'HistoryMaxItems':
          // int value = readNumber();
          // if (value >= -1) {
          //   m_meta->setHistoryMaxItems(value);
          // } else {
          //   qWarning("HistoryMaxItems invalid number");
          // }
          break;
        case 'HistoryMaxSize':
          // int value = readNumber();
          // if (value >= -1) {
          //   m_meta->setHistoryMaxSize(value);
          // } else {
          //   qWarning("HistoryMaxSize invalid number");
          // }
          break;
        case 'Binaries':
          // parseBinaries();
          break;
        case 'CustomData':
          // parseCustomData(m_meta->customData());
          break;
        case 'SettingsChanged':
          // m_meta->setSettingsChanged(readDateTime());
          break;
      }
    }
  }

  private async parseRoot(reader: XmlReader, database: Database) {
    if (!reader.current().isOpen || reader.current().name !== 'Root') {
      throw new Error(`Expected "Root", found "${reader.current().name}"`);
    }

    let groupElementFound = false;

    while (reader.readNextStartElement()) {
      if (reader.current().name === 'Group') {
        if (groupElementFound) {
          throw new Error('Multiple group elements');
        }

        database.rootGroup = await this.parseGroup(reader.readFromCurrent());

        reader.skipCurrentElement();

        groupElementFound = true;
      } else if (reader.current().name === 'DeletedObjects') {
        // parseDeletedObjects();
      } else {
        reader.skipCurrentElement();
      }
    }
  }

  private async parseGroup(reader: XmlReader): Promise<Group> {
    if (!reader.current().isOpen || reader.current().name !== 'Group') {
      throw new Error(`Expected "Group", found "${reader.current().name}"`);
    }

    const group = new Group();

    while (reader.readNextStartElement()) {
      switch (reader.current().name) {
        case 'UUID': {
          const uuid = KdbxXmlReader.readUuid(reader);
          if (uuid === null) {
            throw new Error('Null group uuid');
          } else {
            group.uuid = uuid;
          }
          break;
        }
        case 'Name':
          group.name = KdbxXmlReader.readString(reader);
          break;
        case 'Notes':
          group.notes = KdbxXmlReader.readString(reader);
          break;
        case 'Tags':
          group.tags = KdbxXmlReader.readString(reader);
          break;
        case 'IconID':
          group.iconNumber = KdbxXmlReader.readNumber(reader);
          break;
        case 'CustomIconUUID':
          group.customIcon = KdbxXmlReader.readUuid(reader);
          break;
        case 'Group': {
          group.children.push(await this.parseGroup(reader.readFromCurrent()));
          reader.skipCurrentElement();
          break;
        }
        case 'Entry': {
          group.entries.push(await this.parseEntry(reader.readFromCurrent()));
          reader.skipCurrentElement();
          break;
        }
        default:
          reader.skipCurrentElement();
          break;
      }
    }

    return group;
  }

  private async parseEntry(
    reader: XmlReader,
    isInHistory: boolean = false,
  ): Promise<Entry> {
    if (!reader.current().isOpen || reader.current().name !== 'Entry') {
      throw new Error(`Expected "Entry", found "${reader.current().name}"`);
    }

    const entry = new Entry();

    let uuid: Uuid | undefined;

    while (reader.readNextStartElement()) {
      switch (reader.current().name) {
        case 'UUID': {
          uuid = KdbxXmlReader.readUuid(reader);
          if (uuid === null) {
            throw new Error('Null entry uuid');
          }
          break;
        }
        case 'String': {
          const [key, value, isProtected] = await this.parseEntryString(
            reader.readFromCurrent(),
          );
          if (entry.attributes[key] !== undefined) {
            throw new Error('Duplicate custom attribute found');
          }
          entry.attributes[key] = value;
          if (isProtected) {
            entry.protectedAttributes.push(key);
          }
          break;
        }
        case 'History':
          if (isInHistory) {
            throw new Error('History element in history entry');
          }
          entry.history = await this.parseHistoryItems(
            reader.readFromCurrent(),
          );
          break;
        default:
          reader.skipCurrentElement();
          break;
      }
    }

    if (!uuid) {
      throw new Error('No entry uuid found');
    }

    entry.uuid = uuid;

    return entry;
  }

  private async parseHistoryItems(reader: XmlReader): Promise<Entry[]> {
    if (!reader.current().isOpen || reader.current().name !== 'History') {
      throw new Error(`Expected "History", found "${reader.current().name}"`);
    }

    const history: Entry[] = [];

    while (reader.readNextStartElement()) {
      switch (reader.current().name) {
        case 'Entry':
          history.push(await this.parseEntry(reader.readFromCurrent(), true));
          break;
        default:
          break;
      }

      reader.skipCurrentElement();
    }

    return history;
  }

  private async parseEntryString(
    reader: XmlReader,
  ): Promise<[string, string, boolean]> {
    if (!reader.current().isOpen || reader.current().name !== 'String') {
      throw new Error(`Expected "String", found "${reader.current().name}"`);
    }

    let key: string | undefined;
    let value: string | undefined;
    let isProtected: boolean | undefined;

    while (reader.readNextStartElement()) {
      switch (reader.current().name) {
        case 'Key':
          key = KdbxXmlReader.readString(reader);
          break;
        case 'Value':
          [value, isProtected] = await this.readPotentiallyProtectedString(
            reader,
          );
          break;
        default:
          reader.skipCurrentElement();
          break;
      }
    }

    if (key === undefined || value === undefined) {
      throw new Error('Entry string key or value missing');
    }

    return [key, value, isProtected ?? false];
  }

  private static readString(reader: XmlReader): string {
    if (reader.current().isClose) {
      return '';
    }

    return reader.readElementText();
  }

  private async readPotentiallyProtectedString(
    reader: XmlReader,
  ): Promise<[string, boolean]> {
    const isProtected = KdbxXmlReader.isProtected(reader.current());
    if (reader.current().isClose) {
      return ['', isProtected];
    }

    const text = reader.readElementText();
    if (!isProtected) {
      return [text, isProtected];
    }

    const data = await this.randomStream.process(
      Uint8ArrayWriter.fromBase64(text),
    );
    return [String.fromCharCode(...data), isProtected];
  }

  private static readNumber(reader: XmlReader, radix: number = 10): number {
    const text = reader.readElementText();
    return parseInt(text, radix);
  }

  private static readUuid(reader: XmlReader): Uuid {
    const text = reader.readElementText();
    return uuidStringify(Uint8ArrayWriter.fromBase64(text));
  }

  private async readBinary(reader: XmlReader): Promise<Uint8Array> {
    const value = reader.readElementText();
    let data = Uint8ArrayWriter.fromBase64(value);
    if (KdbxXmlReader.isProtected(reader.current())) {
      data = await this.randomStream.process(data);
    }
    return data;
  }

  private static isProtected(element: XmlElement) {
    return element.attributes.Protected?.toLowerCase() === 'true';
  }
}
