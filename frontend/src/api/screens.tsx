import {
  Project,
  Screen,
  ScreenDetails,
  ArchivedScreenDetails,
  ScreenInspect,
  ScreenHistory,
} from '@/types';
import { QueryFunction } from '@tanstack/react-query';

export const getScreen: QueryFunction<
  ScreenDetails | ArchivedScreenDetails,
  [string, Project['id'], Screen['id']]
> = ({ queryKey }) => {
  const [_key, project_id, screen_id] = queryKey;

  // Prepare the url
  const url = new URL(
    `/api/projects/${project_id}/screens/${screen_id}`,
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

export const getScreenInspect: QueryFunction<
  ScreenInspect | null,
  [string, Project['id'], Screen['id'], 'inspect']
> = ({ queryKey }) => {
  const [_key, project_id, screen_id] = queryKey;

  // Prepare the url
  const url = new URL(
    `/api/projects/${project_id}/screens/${screen_id}/inspect`,
    window.location.origin,
  );

  return fetch(url.toString())
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    })
    .then(response => {
      // Not valid Sketch file
      if (response.code === 417) {
        return null;
      }

      return response;
    })
    .catch(error => {
      throw error;
    });
};

export const getScreenHistory: QueryFunction<
  ScreenHistory | null,
  [string, Project['id'], Screen['id'], 'history']
> = ({ queryKey }) => {
  const [_key, project_id, screen_id] = queryKey;

  // Prepare the url
  const url = new URL(
    `/api/projects/${project_id}/screens/${screen_id}/history`,
    window.location.origin,
  );

  return fetch(url.toString())
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    })
    .then(response => {
      // Not valid Sketch file
      if (response.code === 417) {
        return null;
      }

      return response;
    })
    .catch(error => {
      throw error;
    });
};
