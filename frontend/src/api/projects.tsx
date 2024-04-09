import { Project } from '@/types';

export function getProjects(): Promise<Project[]> {
  return fetch('/api/projects')
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
