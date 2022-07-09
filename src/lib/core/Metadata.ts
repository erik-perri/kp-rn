export default class Metadata {
  private _generator: string;
  private _databaseName: string;

  constructor(generator: string, name: string) {
    this._generator = generator;
    this._databaseName = name;
  }

  get generator(): string {
    return this._generator;
  }

  set generator(value: string) {
    this._generator = value;
  }

  get databaseName(): string {
    return this._databaseName;
  }

  set databaseName(value: string) {
    this._databaseName = value;
  }
}
