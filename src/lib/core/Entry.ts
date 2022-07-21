import {CustomDataItem} from './Database';
import TimeInfo from './TimeInfo';
import {Uuid} from './types';

interface Entry {
  attachments: Record<string, Uint8Array>;
  attributes: Record<string, string>;
  customData: Record<string, CustomDataItem>;
  history: Entry[];
  protectedAttributes: string[];
  timeInfo?: TimeInfo;
  uuid?: Uuid;
}

export default Entry;
