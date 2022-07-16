export abstract class Key {
  protected constructor(protected readonly uuid: string) {
    //
  }

  public abstract getRawKey(): Promise<Uint8Array>;
  public abstract setRawKey(data: Uint8Array): void;
  public abstract serialize(): Uint8Array;
  public abstract deserialize(data: Uint8Array): void;
}
