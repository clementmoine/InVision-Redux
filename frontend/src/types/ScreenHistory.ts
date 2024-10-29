import { Screen, User } from '@/types';

export interface ScreenVersion {
  avatarID: string;
  avatarUrl: string;
  imageUrl: string;
  userID: User['id'];
  serverFileName: '524913658.png';
  createdAt: number; // Timestamp
  version: Screen['imageVersion'];
  screenID: Screen['id'];
  endedAt: number; // Timestamp
  userName: User['name'];
  screenversionid: string;
}

export interface ScreenHistory {
  versions: ScreenVersion[];
  comments: Record<`${number}`, []>; // Do not know what it is used to
}
