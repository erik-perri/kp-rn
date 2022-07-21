import {Uuid} from './types';
import TimeInfo from './TimeInfo';

export default class Entry {
  attachments: Record<string, Uint8Array> = {};
  attributes: Record<string, string> = {};
  history: Entry[] = [];
  protectedAttributes: string[] = [];
  timeInfo?: TimeInfo;
  uuid?: Uuid;
}
