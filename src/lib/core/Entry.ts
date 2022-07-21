import TimeInfo from './TimeInfo';
import {Uuid} from './types';

export default class Entry {
  attachments: Record<string, Uint8Array> = {};
  attributes: Record<string, string> = {};
  history: Entry[] = [];
  protectedAttributes: string[] = [];
  timeInfo?: TimeInfo;
  uuid?: Uuid;
}
