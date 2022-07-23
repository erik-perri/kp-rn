import KpHelperModule from '../utilities/KpHelperModule';
import {Key} from './Key';

export default class ChallengeResponseKey extends Key {
  public static readonly UUID = 'e092495c-e77d-498b-84a1-05ae0d955508';
  private rawKey: Uint8Array | undefined;

  constructor(private readonly deviceUuid: string) {
    super(ChallengeResponseKey.UUID);
  }

  public static isInstance(key: Key): key is ChallengeResponseKey {
    return typeof (key as ChallengeResponseKey).challenge === 'function';
  }

  async challenge(data: Uint8Array): Promise<Uint8Array> {
    return await KpHelperModule.challengeResponse(this.deviceUuid, data);
  }

  async getRawKey(): Promise<Uint8Array> {
    return this.rawKey ?? new Uint8Array(0);
  }

  setRawKey(_data: Uint8Array): void {
    throw new Error('Not implemented');
  }

  deserialize(_data: Uint8Array): void {
    throw new Error('Not implemented');
  }

  serialize(): Uint8Array {
    throw new Error('Not implemented');
  }
}
