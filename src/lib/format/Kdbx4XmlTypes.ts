export interface KeePassStringEntry {
  Key: [string];
  Value:
    | [string]
    | [
        {
          _: string;
          $: {
            Protected: 'True' | 'False';
          };
        },
      ];
}

export interface KeePassEntry {
  UUID: [string];
  String: KeePassStringEntry[];
  History?: [
    {
      Entry: KeePassEntry[];
    },
  ];
  Name: [string];
}

export interface KeepPassGroup {
  UUID: [string];
  Name: [string];
  Entry: KeePassEntry[];
  Group?: KeepPassGroup[];
}

export interface KeePassMeta {
  Generator: [string];
  DatabaseName: [string];
}

export interface KeePassRoot {
  Group: KeepPassGroup[];
}

export interface KeePassFile {
  KeePassFile: {
    Meta: KeePassMeta[];
    Root: KeePassRoot[];
  };
}

export function isKeePassFile(data: unknown): data is KeePassFile {
  const dataAsFile = data as KeePassFile;
  return (
    Array.isArray(dataAsFile?.KeePassFile?.Meta) &&
    dataAsFile.KeePassFile.Meta.length > 0 &&
    typeof dataAsFile.KeePassFile.Meta[0].DatabaseName?.[0] === 'string'
  );
}
