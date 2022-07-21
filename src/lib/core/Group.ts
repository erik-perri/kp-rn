import {CustomDataItem} from './Database';
import Entry from './Entry';
import TimeInfo from './TimeInfo';
import {Uuid} from './types';

export enum TriState {
  Inherit,
  Enable,
  Disable,
}

interface Group {
  children: Group[];
  customData: Record<string, CustomDataItem>;
  customIcon?: Uuid;
  defaultAutoTypeSequence?: string;
  enableAutoType?: TriState;
  enableSearching?: TriState;
  entries: Entry[];
  iconNumber?: number;
  isExpanded?: boolean;
  lastTopVisibleEntry?: Uuid;
  name?: string;
  notes?: string;
  previousParentGroup?: Uuid;
  tags?: string;
  timeInfo?: TimeInfo;
  uuid?: Uuid;
}

export default Group;
