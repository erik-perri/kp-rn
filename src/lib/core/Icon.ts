import {Uuid} from './types';

interface Icon {
  data?: Uint8Array;
  lastModificationTime?: Date;
  name?: string;
  uuid?: Uuid;
}

export default Icon;
