import {Uuid} from './types';

export default class Entry {
  private _uuid: Uuid | undefined;
  private _attributes: Record<string, string> = {};
  private _protectedAttributes: string[] = [];
  private _attachments: Record<string, Uint8Array> = {};
  private _history: Entry[] = [];

  get uuid(): Uuid {
    if (this._uuid === undefined) {
      throw new Error('uuid not initialized');
    }
    return this._uuid;
  }

  set uuid(value: Uuid) {
    this._uuid = value;
  }

  get attributes(): Record<string, string> {
    return this._attributes;
  }

  get protectedAttributes(): string[] {
    return this._protectedAttributes;
  }

  get attachments(): Record<string, Uint8Array> {
    return this._attachments;
  }

  set history(value: Entry[]) {
    this._history = value;
  }

  get history(): Entry[] {
    return this._history;
  }
}
