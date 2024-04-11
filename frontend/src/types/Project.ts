import { Tag, User } from '@/types';
import { Screen, ScreenGroup } from './Screen';

interface ProjectData {
  id: Project['id'];
  type: Project['id'];
  name: string;
  tags: Tag[];
  itemCount: number;
  thumbnailUrl: string;
  isArchived: boolean;
  updatedAt: number; // Timestamp (ms)

  // More (less used)
  url: string;
  spaceID: number;
  userID: User['id'];
  mobileDeviceID: number;
  isFavorite: boolean;
  isOverQuota: boolean;
  isSpaceMember: boolean;
  isProcessed: boolean;
  isInSpace: boolean;
  members: User[];
  companyID: number;
  isMobile: boolean;
  canJoinSpace: boolean;
  backgroundColor: string;
  spaceName: string;
  isCollaborator: boolean;
  isSample: boolean;
}

export interface Project {
  id: number;
  type: 'prototype' | 'board';
  data: ProjectData;
  image: string;
}

export interface ProjectWithScreens extends Project {
  screens: {
    screens: Screen[];
    groups: ScreenGroup[];
    archivedScreensCount: number;
  };
}
