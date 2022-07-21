import Entry from './Entry';
import {Uuid} from './types';
import TimeInfo from './TimeInfo';

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
