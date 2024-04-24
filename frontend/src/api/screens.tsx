import { Project, Screen, ScreenDetails, ArchivedScreenDetails } from '@/types';
import { QueryFunction } from '@tanstack/react-query';

export const getScreen: QueryFunction<
  ScreenDetails | ArchivedScreenDetails,
  [string, Project['id'], Screen['id'], string | undefined]
> = ({ queryKey }) => {
  const [_key, project_id, screen_id, mode = 'preview'] = queryKey;

  // Prepare the url
  const url = new URL(
    `/api/projects/${project_id}/screens/${screen_id}/${mode}`,
    window.location.origin,
  );

  return fetch(url.toString())
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    })
    .then(screen => {
      return screen;
    })
    .catch(error => {
      throw error;
    });
};
