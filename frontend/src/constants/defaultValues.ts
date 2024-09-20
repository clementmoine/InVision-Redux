import { FetchProjectsParams, GetProjectParams } from '@/api/projects';

const projects: Partial<Record<keyof FetchProjectsParams, string>> = {
  search: '',
  type: 'all',
  tag: 'all',
  page: '1',
  limit: '40',
  sort: 'updatedAt',
};

const project: Partial<Record<keyof GetProjectParams, string>> = {
  search: '',
};

const initialZoom = 0.5;

const title = 'InVision';

export default { projects, project, title, initialZoom };
