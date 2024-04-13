import { Screen, Comment } from '@/types';

export interface Conversation {
  isForDevelopment: boolean;
  createdAt: number; // Timestamp (ms)
  y: number;
  isTourPoint: boolean;
  screenID: Screen['id'];
  updatedAt: number; // Timestamp (ms)
  x: number;
  id: number;
  subscribers: [];
  comments: Comment[];
  label: string;
  isComplete: boolean;
  manualOrder: number;
  isPrivate: boolean;
}
