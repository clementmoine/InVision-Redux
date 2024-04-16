import { Project, ProjectWithScreens, Tag } from '@/types';
import { QueryFunction } from '@tanstack/react-query';

export interface FetchProjectsParams {
  project_ids?: Array<Project['id']>;
  type?: 'board' | 'prototype' | 'archived';
  tag?: Tag['id'];
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'updatedAt' | 'name';
}

export interface FetchProjectsResponse {
  data: Project[];
  total: number;
  limit: number;
  page: number;
  previousPage: number;
  nextPage: number;
}

export const fetchProjects: QueryFunction<
  FetchProjectsResponse,
  [string, FetchProjectsParams?]
> = ({ queryKey }) => {
  const [_key, args] = queryKey;

  // Prepare the url
  const url = new URL('/api/projects', window.location.origin);

  // Loop through each property in args and append it to the URL if it exists
  for (const [key, value] of Object.entries(args || {})) {
    if (value !== undefined && value !== null && value !== '') {
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

export interface GetProjectParams {
  search?: string;
}

export const getProject: QueryFunction<
  ProjectWithScreens,
  [string, Project['id'], GetProjectParams]
> = ({ queryKey }) => {
  const [_key, id, args] = queryKey;

  // Prepare the url
  const url = new URL(`/api/projects/${id}`, window.location.origin);

  // Loop through each property in args and append it to the URL if it exists
  for (const [key, value] of Object.entries(args || {})) {
    if (value !== undefined && value !== null && value !== '') {
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
    .then(project => {
      return project;
    })
    .catch(error => {
      throw error;
    });
};
