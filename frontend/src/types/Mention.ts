import { User } from '@/types';

export interface Mention {
  userID: User['id'];
  text: string;
  startPos: number;
  name: User['name'];
  id: number;
}
