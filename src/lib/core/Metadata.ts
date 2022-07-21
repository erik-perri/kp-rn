export default class Metadata {
  private _generator: string;
  private _databaseName: string;
  private _headerHash: Uint8Array | undefined;
  private _description: string | undefined;

  constructor(generator: string, name: string) {
    this._generator = generator;
    this._databaseName = name;
  }

  get databaseName(): string {
    return this._databaseName;
  }

  set databaseName(value: string) {
    this._databaseName = value;
  }

  get description(): string | undefined {
    return this._description;
  }

  set description(value: string | undefined) {
    this._description = value;
  }

  get generator(): string {
    return this._generator;
  }

  set generator(value: string) {
    this._generator = value;
  }

  get headerHash(): Uint8Array | undefined {
    return this._headerHash;
  }

  set headerHash(value: Uint8Array | undefined) {
    this._headerHash = value;
  }
}
