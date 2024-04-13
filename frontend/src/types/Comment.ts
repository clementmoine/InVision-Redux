import { Conversation, Mention, User, UserDetails } from '@/types';

export interface Comment {
  avatarID: UserDetails['avatarID'];
  avatarUrl: User['avatarUrl'];
  userID: User['id'];
  createdAt: number; // Timestamp (ms)
  sketches: Array<unknown>;
  lastRequestAt: number; // Timestamp (ms)
  hasUserLiked: boolean;
  emojiparsedcomment: string;
  likedBy: {
    commentID: Comment['id'];
    name: User['name'];
    id: User['id'];
  }[];
  numberOfLikes: number;
  isUnread: boolean;
  updatedAt: number; // Timestamp (ms)
  id: number;
  comment: string;
  conversationID: Conversation['id'];
  screenImageVersion: number;
  mentions: Mention[];
  userName: User['name'];
}
