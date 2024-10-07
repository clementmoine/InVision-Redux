import { Project } from '@/types';
import { QueryFunction } from '@tanstack/react-query';

export interface FetchProjectByShareIdResponse {
  project_id: Project['id'];
}

export const getProjectByShareId: QueryFunction<
  FetchProjectByShareIdResponse,
  [string, string]
> = ({ queryKey }) => {
  const [_key, shareId] = queryKey;

  // Prepare the url for fetching project by share ID
  const url = new URL(`/api/share/${shareId}`, window.location.origin);

  return fetch(url.toString())
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    })
    .then(projectData => {
      return projectData;
    })
    .catch(error => {
      throw error;
    });
};
