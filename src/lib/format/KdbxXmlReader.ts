import {CustomDataItem, Database, DeletedObject} from '../core/Database';
import Entry from '../core/Entry';
import Group, {TriState} from '../core/Group';
import Icon from '../core/Icon';
import TimeInfo from '../core/TimeInfo';
import {Uuid} from '../core/types';
import {Cipher} from '../crypto/SymmetricCipher';
import {UUID_SIZE} from '../utilities/sizes';
import Uint8ArrayReader from '../utilities/Uint8ArrayReader';
import Uint8ArrayWriter from '../utilities/Uint8ArrayWriter';
import {stringifyUuid} from '../utilities/uuid';
import {XmlElement, XmlReader} from '../utilities/XmlReader';
import {FILE_VERSION_4} from './Keepass2';

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
      switch (reader.current().name) {
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
        default:
          reader.skipCurrentElement();
          break;
      }
    }
  }

  private async parseMeta(reader: XmlReader, database: Database) {
    if (!reader.current().isOpen || reader.current().name !== 'Meta') {
      throw new Error(`Expected "Meta", found "${reader.current().name}"`);
    }

    while (reader.readNextStartElement()) {
      switch (reader.current().name) {
        case 'Generator':
          database.metadata.generator = KdbxXmlReader.readString(reader);
          break;
        case 'HeaderHash':
          database.metadata.headerHash = await this.readBinary(reader);
          break;
        case 'DatabaseName':
          database.metadata.name = KdbxXmlReader.readString(reader);
          break;
        case 'DatabaseNameChanged':
          database.metadata.nameChanged = KdbxXmlReader.readDateTime(reader);
          break;
        case 'DatabaseDescription':
          database.metadata.description = KdbxXmlReader.readString(reader);
          break;
        case 'DatabaseDescriptionChanged':
          database.metadata.descriptionChanged =
            KdbxXmlReader.readDateTime(reader);
          break;
        case 'DefaultUserName':
          database.metadata.defaultUserName = KdbxXmlReader.readString(reader);
          break;
        case 'DefaultUserNameChanged':
          database.metadata.defaultUserNameChanged =
            KdbxXmlReader.readDateTime(reader);
          break;
        case 'MaintenanceHistoryDays':
          database.metadata.maintenanceHistoryDays =
            KdbxXmlReader.readNumber(reader);
          break;
        case 'Color':
          database.metadata.color = KdbxXmlReader.readColor(reader);
          break;
        case 'MasterKeyChanged':
          database.metadata.masterKeyChanged =
            KdbxXmlReader.readDateTime(reader);
          break;
        case 'MasterKeyChangeRec':
          database.metadata.masterKeyChangeRec =
            KdbxXmlReader.readNumber(reader);
          break;
        case 'MasterKeyChangeForce':
          database.metadata.masterKeyChangeForce =
            KdbxXmlReader.readNumber(reader);
          break;
        case 'MemoryProtection':
          KdbxXmlReader.parseMemoryProtection(
            reader.readFromCurrent(),
            database,
          );
          break;
        case 'CustomIcons':
          await this.parseCustomIcons(reader.readFromCurrent(), database);
          break;
        case 'RecycleBinEnabled':
          database.metadata.recycleBinEnabled =
            KdbxXmlReader.readBoolean(reader);
          break;
        case 'RecycleBinUUID':
          database.metadata.recycleBinUuid = await this.readUuid(reader);
          break;
        case 'RecycleBinChanged':
          database.metadata.recycleBinChanged =
            KdbxXmlReader.readDateTime(reader);
          break;
        case 'EntryTemplatesGroup':
          database.metadata.entryTemplatesGroup = await this.readUuid(reader);
          break;
        case 'EntryTemplatesGroupChanged':
          database.metadata.entryTemplatesGroupChanged =
            KdbxXmlReader.readDateTime(reader);
          break;
        case 'LastSelectedGroup':
          database.metadata.lastSelectedGroup = await this.readUuid(reader);
          break;
        case 'LastTopVisibleGroup':
          database.metadata.lastTopVisibleGroup = await this.readUuid(reader);
          break;
        case 'HistoryMaxItems':
          database.metadata.historyMaxItems =
            KdbxXmlReader.readUnsignedNumber(reader);
          break;
        case 'HistoryMaxSize':
          database.metadata.historyMaxSize =
            KdbxXmlReader.readUnsignedNumber(reader);
          break;
        case 'Binaries':
          throw new Error('"Binaries" not implemented');
        case 'CustomData':
          database.metadata.customData = KdbxXmlReader.parseCustomData(
            reader.readFromCurrent(),
          );
          break;
        case 'SettingsChanged':
          database.metadata.settingsChanged =
            KdbxXmlReader.readDateTime(reader);
          break;
        default:
          reader.skipCurrentElement();
          break;
      }
    }
  }

  private static parseCustomData(
    reader: XmlReader,
  ): Record<string, CustomDataItem> {
    if (!reader.current().isOpen || reader.current().name !== 'CustomData') {
      throw new Error(
        `Expected "CustomData", found "${reader.current().name}"`,
      );
    }

    const customData: Record<string, CustomDataItem> = {};

    while (reader.readNextStartElement()) {
      switch (reader.current().name) {
        case 'Item': {
          const item = KdbxXmlReader.parseCustomDataItem(
            reader.readFromCurrent(),
          );
          if (!item.key || !item.value) {
            throw new Error('Missing custom data key or value');
          }

          customData[item.key] = item;
          break;
        }
        default:
          reader.skipCurrentElement();
          break;
      }
    }

    return customData;
  }

  private static parseCustomDataItem(reader: XmlReader): CustomDataItem {
    if (!reader.current().isOpen || reader.current().name !== 'Item') {
      throw new Error(
        `Expected "CustomData", found "${reader.current().name}"`,
      );
    }

    const customData: CustomDataItem = {};

    while (reader.readNextStartElement()) {
      switch (reader.current().name) {
        case 'Key':
          customData.key = KdbxXmlReader.readString(reader);
          break;
        case 'Value':
          customData.value = KdbxXmlReader.readString(reader);
          break;
        case 'LastModificationTime':
          customData.lastModified = KdbxXmlReader.readDateTime(reader);
          break;
        default:
          reader.skipCurrentElement();
          break;
      }
    }

    return customData;
  }

  private static parseMemoryProtection(reader: XmlReader, database: Database) {
    if (
      !reader.current().isOpen ||
      reader.current().name !== 'MemoryProtection'
    ) {
      throw new Error(
        `Expected "MemoryProtection", found "${reader.current().name}"`,
      );
    }

    while (reader.readNextStartElement()) {
      switch (reader.current().name) {
        case 'ProtectTitle':
          database.metadata.protectTitle = KdbxXmlReader.readBoolean(reader);
          break;
        case 'ProtectUserName':
          database.metadata.protectUserName = KdbxXmlReader.readBoolean(reader);
          break;
        case 'ProtectPassword':
          database.metadata.protectPassword = KdbxXmlReader.readBoolean(reader);
          break;
        case 'ProtectURL':
          database.metadata.protectURL = KdbxXmlReader.readBoolean(reader);
          break;
        case 'ProtectNotes':
          database.metadata.protectNotes = KdbxXmlReader.readBoolean(reader);
          break;
        default:
          reader.skipCurrentElement();
          break;
      }
    }
  }

  private async parseCustomIcons(reader: XmlReader, database: Database) {
    if (!reader.current().isOpen || reader.current().name !== 'CustomIcons') {
      throw new Error(
        `Expected "CustomIcons", found "${reader.current().name}"`,
      );
    }

    while (reader.readNextStartElement()) {
      switch (reader.current().name) {
        case 'Icon':
          const icon = await this.parseIcon(reader.readFromCurrent());
          if (!icon.uuid || !icon.data) {
            throw new Error('Missing icon uuid or data');
          }

          database.metadata.customIcons[icon.uuid] = icon;
          break;
        default:
          reader.skipCurrentElement();
          break;
      }
    }
  }

  private async parseIcon(reader: XmlReader): Promise<Icon> {
    if (!reader.current().isOpen || reader.current().name !== 'Icon') {
      throw new Error(`Expected "Icon", found "${reader.current().name}"`);
    }

    const icon: Icon = {};

    while (reader.readNextStartElement()) {
      switch (reader.current().name) {
        case 'UUID':
          icon.uuid = await this.readUuid(reader);
          break;
        case 'Data':
          icon.data = await this.readBinary(reader);
          break;
        case 'Name':
          icon.name = KdbxXmlReader.readString(reader);
          break;
        case 'LastModificationTime':
          icon.lastModificationTime = KdbxXmlReader.readDateTime(reader);
          break;
        default:
          reader.skipCurrentElement();
          break;
      }
    }

    return icon;
  }

  private async parseRoot(reader: XmlReader, database: Database) {
    if (!reader.current().isOpen || reader.current().name !== 'Root') {
      throw new Error(`Expected "Root", found "${reader.current().name}"`);
    }

    while (reader.readNextStartElement()) {
      switch (reader.current().name) {
        case 'Group':
          if (database.rootGroup) {
            throw new Error('Multiple group elements');
          }

          database.rootGroup = await this.parseGroup(reader.readFromCurrent());
          break;
        case 'DeletedObjects':
          database.deletedObjects = await this.parseDeletedObjects(
            reader.readFromCurrent(),
          );
          break;
        default:
          reader.skipCurrentElement();
          break;
      }
    }
  }

  private async parseGroup(reader: XmlReader): Promise<Group> {
    if (!reader.current().isOpen || reader.current().name !== 'Group') {
      throw new Error(`Expected "Group", found "${reader.current().name}"`);
    }

    const group: Group = {
      entries: [],
      children: [],
      customData: {},
    };

    while (reader.readNextStartElement()) {
      switch (reader.current().name) {
        case 'UUID': {
          const uuid = await this.readUuid(reader);
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
        case 'Times':
          group.timeInfo = await KdbxXmlReader.parseTimes(
            reader.readFromCurrent(),
          );
          break;
        case 'IconID':
          group.iconNumber = KdbxXmlReader.readNumber(reader);
          break;
        case 'CustomIconUUID':
          group.customIcon = await this.readUuid(reader);
          break;
        case 'Group':
          group.children.push(await this.parseGroup(reader.readFromCurrent()));
          break;
        case 'Entry':
          group.entries.push(await this.parseEntry(reader.readFromCurrent()));
          break;
        case 'CustomData':
          group.customData = KdbxXmlReader.parseCustomData(reader);
          break;
        case 'IsExpanded':
          group.isExpanded = KdbxXmlReader.readBoolean(reader);
          break;
        case 'DefaultAutoTypeSequence':
          group.defaultAutoTypeSequence = KdbxXmlReader.readString(reader);
          break;
        case 'EnableAutoType':
          group.enableAutoType = KdbxXmlReader.readTriState(reader);
          break;
        case 'EnableSearching':
          group.enableSearching = KdbxXmlReader.readTriState(reader);
          break;
        case 'LastTopVisibleEntry':
          group.lastTopVisibleEntry = await this.readUuid(reader);
          break;
        case 'PreviousParentGroup':
          group.previousParentGroup = await this.readUuid(reader);
          break;
        default:
          reader.skipCurrentElement();
          break;
      }
    }

    return group;
  }

  private async parseDeletedObjects(
    reader: XmlReader,
  ): Promise<DeletedObject[]> {
    if (
      !reader.current().isOpen ||
      reader.current().name !== 'DeletedObjects'
    ) {
      throw new Error(
        `Expected "DeletedObjects", found "${reader.current().name}"`,
      );
    }

    const objects: DeletedObject[] = [];

    if (reader.current().isClose) {
      return objects;
    }

    while (reader.readNextStartElement()) {
      switch (reader.current().name) {
        case 'DeletedObject':
          objects.push(await this.parseDeletedObject(reader.readFromCurrent()));
          break;
        default:
          reader.skipCurrentElement();
          break;
      }
    }

    return objects;
  }

  private async parseDeletedObject(reader: XmlReader): Promise<DeletedObject> {
    if (!reader.current().isOpen || reader.current().name !== 'DeletedObject') {
      throw new Error(
        `Expected "DeletedObject", found "${reader.current().name}"`,
      );
    }

    const deleted: DeletedObject = {};

    while (reader.readNextStartElement()) {
      switch (reader.current().name) {
        case 'UUID':
          deleted.uuid = await this.readUuid(reader);
          break;
        case 'DeletionTime':
          deleted.deletionTime = await KdbxXmlReader.readDateTime(reader);
          break;
        default:
          reader.skipCurrentElement();
          break;
      }
    }

    return deleted;
  }

  private async parseEntry(
    reader: XmlReader,
    isInHistory: boolean = false,
  ): Promise<Entry> {
    if (!reader.current().isOpen || reader.current().name !== 'Entry') {
      throw new Error(`Expected "Entry", found "${reader.current().name}"`);
    }

    const entry: Entry = {
      attachments: {},
      attributes: {},
      customData: {},
      history: [],
      protectedAttributes: [],
    };

    let uuid: Uuid | undefined;

    while (reader.readNextStartElement()) {
      switch (reader.current().name) {
        case 'UUID': {
          uuid = await this.readUuid(reader);
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
        case 'Times':
          entry.timeInfo = await KdbxXmlReader.parseTimes(
            reader.readFromCurrent(),
          );
          break;
        case 'History':
          if (isInHistory) {
            throw new Error('History element in history entry');
          }
          entry.history = await this.parseHistoryItems(
            reader.readFromCurrent(),
          );
          break;
        case 'CustomData':
          entry.customData = KdbxXmlReader.parseCustomData(reader);
          break;
        case 'IconID':
          entry.iconNumber = KdbxXmlReader.readNumber(reader);
          break;
        case 'CustomIconUUID':
          entry.customIcon = await this.readUuid(reader);
          break;
        case 'ForegroundColor':
          entry.foregroundColor = KdbxXmlReader.readColor(reader);
          break;
        case 'BackgroundColor':
          entry.backgroundColor = KdbxXmlReader.readColor(reader);
          break;
        case 'OverrideURL':
          entry.overrideURL = KdbxXmlReader.readString(reader);
          break;
        case 'Tags':
          entry.tags = KdbxXmlReader.readString(reader);
          break;
        case 'QualityCheck':
          entry.qualityCheck = KdbxXmlReader.readBoolean(reader);
          break;
        // TODO Binary
        // TODO AutoType
        case 'PreviousParentGroup':
          entry.previousParentGroup = await this.readUuid(reader);
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
          reader.skipCurrentElement();
          break;
      }
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

  private static async parseTimes(reader: XmlReader): Promise<TimeInfo> {
    if (!reader.current().isOpen || reader.current().name !== 'Times') {
      throw new Error(`Expected "Times", found "${reader.current().name}"`);
    }

    const timeInfo: TimeInfo = {};

    while (reader.readNextStartElement()) {
      switch (reader.current().name) {
        case 'LastModificationTime':
          timeInfo.lastModificationTime = KdbxXmlReader.readDateTime(reader);
          break;
        case 'CreationTime':
          timeInfo.creationTime = KdbxXmlReader.readDateTime(reader);
          break;
        case 'LastAccessTime':
          timeInfo.lastAccessTime = KdbxXmlReader.readDateTime(reader);
          break;
        case 'ExpiryTime':
          timeInfo.expiryTime = KdbxXmlReader.readDateTime(reader);
          break;
        case 'Expires':
          timeInfo.expires = KdbxXmlReader.readBoolean(reader);
          break;
        case 'UsageCount':
          timeInfo.usageCount = KdbxXmlReader.readNumber(reader);
          break;
        case 'LocationChanged':
          timeInfo.locationChanged = KdbxXmlReader.readDateTime(reader);
          break;
        default:
          reader.skipCurrentElement();
          break;
      }
    }

    return timeInfo;
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

  private static readUnsignedNumber(
    reader: XmlReader,
    radix: number = 10,
  ): number {
    const text = reader.readElementText();
    const value = parseInt(text, radix);

    if (value < 0) {
      throw new Error(`Invalid unsigned number "${text}"`);
    }

    return value;
  }

  private async readUuid(reader: XmlReader): Promise<Uuid> {
    const data = await this.readBinary(reader);
    if (data.byteLength !== UUID_SIZE) {
      throw new Error('Invalid uuid value');
    }

    return stringifyUuid(data);
  }

  private static readDateTime(reader: XmlReader): Date {
    const value = KdbxXmlReader.readString(reader);
    if (KdbxXmlReader.isBase64(value)) {
      let data = Uint8ArrayWriter.leftJustify(
        Uint8ArrayWriter.fromBase64(value),
        8,
      ).slice(0, 8);

      const secondsSinceBc = Uint8ArrayReader.toUInt64LE(data);
      const secondsSinceBcAsNumber = secondsSinceBc.toJSNumber();
      if (secondsSinceBc.greater(secondsSinceBcAsNumber)) {
        throw new Error(`Date outside of range: ${secondsSinceBc}`);
      }

      const date = new Date();
      date.setUTCFullYear(0, 0, 0);
      date.setUTCHours(0, 0, 0, 0);
      date.setUTCSeconds(secondsSinceBcAsNumber);
      return date;
    }

    throw new Error('Non-encoded dates not implemented');
  }

  private static readBoolean(reader: XmlReader): boolean {
    const value = KdbxXmlReader.readString(reader);
    if (!value.length) {
      return false;
    }

    const valueAsLower = value.toLowerCase();
    if (valueAsLower === 'true') {
      return true;
    }
    if (valueAsLower === 'false') {
      return false;
    }

    throw new Error(`Invalid bool value "${value}"`);
  }

  private static readTriState(reader: XmlReader): TriState {
    const value = KdbxXmlReader.readString(reader).toLowerCase();
    if (value === 'null') {
      return TriState.Inherit;
    } else if (value === 'true') {
      return TriState.Enable;
    } else if (value === 'false') {
      return TriState.Disable;
    }

    throw new Error(`Invalid TriState value "${value}"`);
  }

  private static readColor(reader: XmlReader): string {
    const colorString = KdbxXmlReader.readString(reader);
    if (!colorString.length) {
      return colorString;
    }

    if (!colorString.match(/^#[0-f]{6}$/)) {
      throw new Error('Invalid color value');
    }

    return colorString;
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

  private static isBase64(input: string): boolean {
    return Boolean(
      input.match(/(^(?:[a-z\d+/]{4})*(?:[a-z\d+/]{3}=|[a-z\d+/]{2}==)?$)/i),
    );
  }
}
