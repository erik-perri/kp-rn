import Entry from './Entry';
import TimeInfo from './TimeInfo';
import {Uuid} from './types';

export default class Group {
  children: Group[] = [];
  customIcon?: Uuid;
  entries: Entry[] = [];
  iconNumber?: number;
  name?: string;
  notes?: string;
  tags?: string;
  timeInfo?: TimeInfo;
  uuid?: Uuid;
}
