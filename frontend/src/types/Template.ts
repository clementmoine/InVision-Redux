import { Project, Screen } from '@/types';

export interface Template {
  screens: Screen['id'][];
  name: string;
  id: number;
  projectID: Project['id'];
}
