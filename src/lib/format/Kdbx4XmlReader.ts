import {Cipher} from '../crypto/SymmetricCipher';
import Uint8ArrayReader from '../utilities/Uint8ArrayReader';
import Uint8ArrayWriter from '../utilities/Uint8ArrayWriter';
import {stringifyUuid} from '../utilities/uuid';
import {
  isKeePassFile,
  KeePassEntry,
  KeePassFile,
  KeepPassGroup,
} from './Kdbx4XmlTypes';

export default class Kdbx4XmlReader {
  async decodeFile(
    parsedXml: unknown,
    randomStream: Cipher,
  ): Promise<KeePassFile> {
    if (!isKeePassFile(parsedXml)) {
      throw new Error('Unknown file format');
    }

    for (
      let groupIndex = 0;
      groupIndex < parsedXml.KeePassFile.Root[0].Group.length;
      groupIndex++
    ) {
      parsedXml.KeePassFile.Root[0].Group[groupIndex] = await this.decodeGroup(
        parsedXml.KeePassFile.Root[0].Group[groupIndex],
        randomStream,
      );
    }

    return parsedXml;
  }

  private async decodeGroup(
    group: KeepPassGroup,
    randomStream: Cipher,
  ): Promise<KeepPassGroup> {
    group.UUID[0] = Kdbx4XmlReader.decodeUuid(group.UUID[0]);

    if (group.Entry) {
      for (let entryIndex = 0; entryIndex < group.Entry.length; entryIndex++) {
        group.Entry[entryIndex] = await this.decodeEntry(
          group.Entry[entryIndex],
          randomStream,
        );
      }
    }

    if (group.Group) {
      for (let groupIndex = 0; groupIndex < group.Group.length; groupIndex++) {
        group.Group[groupIndex] = await this.decodeGroup(
          group.Group[groupIndex],
          randomStream,
        );
      }
    }

    return group;
  }

  private async decodeEntry(
    entry: KeePassEntry,
    randomStream: Cipher,
  ): Promise<KeePassEntry> {
    entry.UUID[0] = Kdbx4XmlReader.decodeUuid(entry.UUID[0]);

    for (
      let stringIndex = 0;
      stringIndex < entry.String.length;
      stringIndex++
    ) {
      const value = entry.String[stringIndex].Value[0];
      if (value === undefined || typeof value === 'string') {
        continue;
      }

      if (value.$.Protected !== 'True') {
        entry.String[stringIndex].Value = [value._];
        continue;
      }

      entry.String[stringIndex].Value = [
        value._
          ? await Kdbx4XmlReader.decodeProtectedString(value._, randomStream)
          : '',
      ];
    }

    if (entry.History) {
      for (
        let historyIndex = 0;
        historyIndex < entry.History.length;
        historyIndex++
      ) {
        if (!entry.History[historyIndex]) {
          continue;
        }

        for (
          let entryIndex = 0;
          entryIndex < entry.History[historyIndex].Entry.length;
          entryIndex++
        ) {
          entry.History[historyIndex].Entry[entryIndex] =
            await this.decodeEntry(
              entry.History[historyIndex].Entry[entryIndex],
              randomStream,
            );
        }
      }
    }

    return entry;
  }

  private static decodeUuid(value: string): string {
    return stringifyUuid(Uint8ArrayWriter.fromBase64(value));
  }

  private static async decodeProtectedString(
    value: string,
    randomStream: Cipher,
  ): Promise<string> {
    const decrypted = await randomStream.process(
      Uint8ArrayWriter.fromBase64(value),
    );

    return Uint8ArrayReader.toString(decrypted);
  }
}
