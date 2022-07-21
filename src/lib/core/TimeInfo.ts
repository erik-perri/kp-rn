export default class TimeInfo {
  private _lastModificationTime: Date | undefined;
  private _creationTime: Date | undefined;
  private _lastAccessTime: Date | undefined;
  private _expiryTime: Date | undefined;
  private _expires: boolean | undefined;
  private _usageCount: number | undefined;
  private _locationChanged: Date | undefined;

  get lastModificationTime(): Date {
    if (this._lastModificationTime === undefined) {
      throw new Error('lastModificationTime not initialized');
    }
    return this._lastModificationTime;
  }

  set lastModificationTime(value: Date) {
    this._lastModificationTime = value;
  }

  get creationTime(): Date {
    if (this._creationTime === undefined) {
      throw new Error('creationTime not initialized');
    }
    return this._creationTime;
  }

  set creationTime(value: Date) {
    this._creationTime = value;
  }

  get lastAccessTime(): Date {
    if (this._lastAccessTime === undefined) {
      throw new Error('lastAccessTime not initialized');
    }
    return this._lastAccessTime;
  }

  set lastAccessTime(value: Date) {
    this._lastAccessTime = value;
  }

  get expiryTime(): Date {
    if (this._expiryTime === undefined) {
      throw new Error('expiryTime not initialized');
    }
    return this._expiryTime;
  }

  set expiryTime(value: Date) {
    this._expiryTime = value;
  }

  get expires(): boolean {
    if (this._expires === undefined) {
      throw new Error('expires not initialized');
    }
    return this._expires;
  }

  set expires(value: boolean) {
    this._expires = value;
  }

  get usageCount(): number {
    if (this._usageCount === undefined) {
      throw new Error('usageCount not initialized');
    }
    return this._usageCount;
  }

  set usageCount(value: number) {
    this._usageCount = value;
  }

  get locationChanged(): Date {
    if (this._locationChanged === undefined) {
      throw new Error('locationChanged not initialized');
    }
    return this._locationChanged;
  }

  set locationChanged(value: Date) {
    this._locationChanged = value;
  }
}
