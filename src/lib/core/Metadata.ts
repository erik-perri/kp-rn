import {Uuid} from './types';

export default class Metadata {
  color?: string;
  defaultUserName?: string;
  defaultUserNameChanged?: Date;
  description?: string;
  descriptionChanged?: Date;
  entryTemplatesGroup?: Uuid;
  entryTemplatesGroupChanged?: Date;
  generator?: string;
  headerHash?: Uint8Array;
  historyMaxItems?: number;
  historyMaxSize?: number;
  lastSelectedGroup?: Uuid;
  lastTopVisibleGroup?: Uuid;
  maintenanceHistoryDays?: number;
  masterKeyChanged?: Date;
  masterKeyChangeForce?: number;
  masterKeyChangeRec?: number;
  name?: string;
  nameChanged?: Date;
  recycleBinChanged?: Date;
  recycleBinEnabled?: boolean;
  recycleBinUuid?: Uuid;
  settingsChanged?: Date;
}
