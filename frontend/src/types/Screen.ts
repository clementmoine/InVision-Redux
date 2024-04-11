import { User, Project } from '@/types';

export interface Screen {
  id: number;
  sort: number;
  name: string;
  isArchived: boolean;
  thumbnailUrl: string;
  screenGroupId: number;
  isPlaceholder: boolean;
  backgroundColor: string;
  updatedAt: number; // Timestamp (ms)
  createdAt: number; // Timestamp (ms)

  // More (less used)
  clientFilename: string;
  conversationCount: number;
  hotspotCount: number;
  imageVersion: number;
  isDefaultWorkflowStatus: boolean;
  isProcessed: boolean;
  prioritySort: number;
  projectID: Project['id'];
  screenTypeID: number;
  screenUploadState: number;
  serverFileName: string;
  sourceID: number;
  unreadConversationCount: number;
  updatedByAvatarID: string;
  updatedByAvatarUrl: string;
  updatedByUserEmail: string;
  updatedByUserInitials: string;
  updatedByUserName: string;
  userID: User['id'];
  workflowStatusClass: string;
  workflowStatusID: number;
}

export interface ScreenGroup {
  dividerID: number;
  expanded: boolean;
  label: string;
  position: number;
  projectID: Project['id'];
  sort: number;
  type: 'divider';
}
