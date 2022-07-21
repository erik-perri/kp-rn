import {CustomDataItem} from './Database';
import TimeInfo from './TimeInfo';
import {Uuid} from './types';

interface Entry {
  attachments: Record<string, Uint8Array>;
  attributes: Record<string, string>;
  backgroundColor?: string;
  customData: Record<string, CustomDataItem>;
  customIcon?: Uuid;
  foregroundColor?: string;
  history: Entry[];
  iconNumber?: number;
  overrideURL?: string;
  previousParentGroup?: Uuid;
  protectedAttributes: string[];
  qualityCheck?: boolean;
  tags?: string;
  timeInfo?: TimeInfo;
  uuid?: Uuid;
}

export default Entry;
