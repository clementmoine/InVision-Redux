import { Tag } from '@/types';

export function getTags(): Promise<Tag[]> {
  return fetch('/api/tags')
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
}
