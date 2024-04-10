import { GetProjectsParams } from '@/api/projects';

export const defaultValues: Partial<Record<keyof GetProjectsParams, string>> = {
  search: '',
  type: 'all',
  tag: 'all',
  page: '1',
  limit: '10',
  sort: 'title',
};

export default defaultValues;
