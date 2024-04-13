import {
  User,
  Project,
  UserDetails,
  Template,
  Divider,
  Hotspot,
  Conversation,
  ProjectStatus,
  ProjectData,
} from '@/types';

export interface ScreenForProject {
  id: number;
  sort: number;
  name: string;
  isArchived: boolean;
  thumbnailUrl: string;
  isPlaceholder: boolean;
  backgroundColor: string;
  screenGroupId: Divider['dividerID'];
  updatedAt: number; // Timestamp (ms)
  createdAt: number; // Timestamp (ms)

  // More (less used / unused)
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
  updatedByAvatarID: UserDetails['avatarID'];
  updatedByAvatarUrl: User['avatarUrl'];
  updatedByUserEmail: UserDetails['email'];
  updatedByUserInitials: string;
  updatedByUserName: User['name'];
  userID: User['id'];
  workflowStatusClass: string;
  workflowStatusID: number;
}
export interface Screen extends ScreenForProject {
  zoomScrollBehavior: number;
  backgroundFrame: boolean;
  backgroundImagePosition: string;
  width: number;
  assetID: number;
  fixedHeaderHeight: number;
  imageUrl: string;
  height: number;
  backgroundAutostretch: boolean;
  fixedFooterHeight: number;
  alignment: string;
  backgroundImageID: string;
}

// Note: Some types are unknown due to lack of samples to type them properly
export interface ScreenDetails {
  projectBackgroundImages: {
    id: number;
    width: number;
    height: number;
    imageUrl: string;
    createdAt: number; // Timestamp (ms)
    updatedAt: number; // Timestamp (ms)
    projectID: ProjectData['id'];

    // More (less used / unused)
    imageVersion: number;
    serverFileName: string;
    clientFilename: string;
  }[];
  projectMembers: User[];
  dividers: Divider[];
  projectBackgroundColors: Array<unknown>;
  allHotspots: Hotspot[];
  conversations: Conversation[];
  placeholders: {
    filename: string;
    id: number;
  };
  permissions: Record<string, unknown>;
  activeScreens: Screen[];
  space: {
    id: number;
  };
  templates: Template[];
  v: number;
  screenID: Screen['id'];
  projectStakeholders: Array<unknown>;
  project: {
    userID: User['id'];
    mobileDeviceID: ProjectData['mobileDeviceID'];
    homeScreenID: Screen['id'];
    mobileStatusbarBackgroundColor: `#${string}`;
    isOverQuota: ProjectData['isOverQuota'];
    mobileStatusbarFontColor: string;
    sortTypeID: number;
    name: ProjectData['name'];
    id: ProjectData['id'];
    mobileStatusbarIsOpaque: boolean;
    isMobile: ProjectData['isMobile'];
    mobileStatusbarIsVisible: boolean;
  };
  projectMemberCount: number;
  projectStatuses: ProjectStatus[];
  canViewPrivateComments: boolean;
  hotspots: Hotspot[];
  unreadConversationsCount: number;
  projectOwner: UserDetails;
}
