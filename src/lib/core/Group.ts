import Entry from './Entry';
import {Uuid} from './types';

export default class Group {
  private _uuid: Uuid | undefined;
  private _name: string | undefined;
  private _notes: string | undefined;
  private _tags: string | undefined;
  private _iconNumber: number | undefined;
  private _customIcon: Uuid | undefined;
  private _children: Group[] = [];
  private _entries: Entry[] = [];

  get uuid(): Uuid {
    if (this._uuid === undefined) {
      throw new Error('uuid not initialized');
    }
    return this._uuid;
  }

  set uuid(value: Uuid) {
    this._uuid = value;
  }

  get name(): string {
    if (this._name === undefined) {
      throw new Error('name not initialized');
    }
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get notes(): string {
    if (this._notes === undefined) {
      throw new Error('notes not initialized');
    }
    return this._notes;
  }

  set notes(value: string) {
    this._notes = value;
  }

  get tags(): string {
    if (this._tags === undefined) {
      throw new Error('tags not initialized');
    }
    return this._tags;
  }

  set tags(value: string) {
    this._tags = value;
  }

  get iconNumber(): number {
    if (this._iconNumber === undefined) {
      throw new Error('iconNumber not initialized');
    }
    return this._iconNumber;
  }

  set iconNumber(value: number) {
    this._iconNumber = value;
  }

  get customIcon(): Uuid {
    if (this._customIcon === undefined) {
      throw new Error('customIcon not initialized');
    }
    return this._customIcon;
  }

  set customIcon(value: Uuid) {
    this._customIcon = value;
  }

  get children(): Group[] {
    return this._children;
  }

  get entries(): Entry[] {
    return this._entries;
  }
}
