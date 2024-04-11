import { FetchProjectsParams, GetProjectParams } from '@/api/projects';

const projects: Partial<Record<keyof FetchProjectsParams, string>> = {
  search: '',
  type: 'all',
  tag: 'all',
  page: '1',
  limit: '10',
  sort: 'update',
};

const project: Partial<Record<keyof GetProjectParams, string>> = {
  search: '',
};

export default { projects, project };
