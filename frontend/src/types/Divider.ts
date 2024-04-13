import { Project } from '@/types';

export interface Divider {
  position: number;
  sort: number;
  type: 'divider';
  label: string;
  projectID: Project['id'];
  dividerID: number;
  expanded: boolean;
}
