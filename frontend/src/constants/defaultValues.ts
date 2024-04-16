import { FetchProjectsParams, GetProjectParams } from '@/api/projects';

const projects: Partial<Record<keyof FetchProjectsParams, string>> = {
  search: '',
  type: 'all',
  tag: 'all',
  page: '1',
  limit: '20',
  sort: 'updatedAt',
};

const project: Partial<Record<keyof GetProjectParams, string>> = {
  search: '',
};

export default { projects, project };