import Icon from './Icon';
import {Uuid} from './types';

interface Metadata {
  color?: string;
  customIcons: Record<Uuid, Icon>;
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
  protectNotes?: boolean;
  protectPassword?: boolean;
  protectTitle?: boolean;
  protectURL?: boolean;
  protectUserName?: boolean;
  recycleBinChanged?: Date;
  recycleBinEnabled?: boolean;
  recycleBinUuid?: Uuid;
  settingsChanged?: Date;
}

export default Metadata;
