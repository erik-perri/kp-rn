import {CustomDataItem} from './Database';
import TimeInfo from './TimeInfo';
import {Uuid} from './types';

export interface AutoTypeAssociation {
  window?: string;
  sequence?: string;
}

interface Entry {
  attachments: Record<string, Uint8Array>;
  attributes: Record<string, string>;
  autoTypeAssociations: AutoTypeAssociation[];
  autoTypeEnabled?: boolean;
  autoTypeObfuscation?: number;
  backgroundColor?: string;
  customData: Record<string, CustomDataItem>;
  customIcon?: Uuid;
  defaultAutoTypeSequence?: string;
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
