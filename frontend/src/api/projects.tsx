import { Project, Tag } from '@/types';
import { QueryFunction } from '@tanstack/react-query';

export interface GetProjectsParams {
  project_ids?: Array<Project['id']>;
  type?: 'board' | 'prototype';
  tag?: Tag['id'];
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'update' | 'title';
}

export interface GetProjectsResponse {
  data: Project[];
  total: number;
  limit: number;
  page: number;
}

export const getProjects: QueryFunction<
  GetProjectsResponse,
  [string, GetProjectsParams?]
> = ({ queryKey }) => {
  const [_key, args] = queryKey;

  // Prepare the url
  const url = new URL('/api/projects', window.location.origin);

  // Loop through each property in args and append it to the URL if it exists
  for (const [key, value] of Object.entries(args || {})) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(val => {
          url.searchParams.append(key, val.toString());
        });
      } else {
        url.searchParams.append(key, value.toString());
      }
    }
  }

  return fetch(url.toString())
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    })
    .then(projects => {
      return projects;
    })
    .catch(error => {
      throw error;
    });
};
