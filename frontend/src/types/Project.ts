import { Tag } from '@/types';

interface ProjectData {
  id: Project['id'];
  type: Project['id'];
  name: string;
  tags: Tag[];
  itemCount: number;
  thumbnailUrl: string;
}

export interface Project {
  id: number;
  type: 'prototype' | 'board';
  data: ProjectData;
  image: string;
}
