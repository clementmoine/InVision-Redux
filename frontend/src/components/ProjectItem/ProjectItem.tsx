import React from 'react';
import { Link } from 'react-router-dom';

import { Project } from '@types';

import styles from './ProjectItem.module.scss';

interface ProjectItemProps {
  project: Project;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project }) => {
  return (
    <div className={styles.projectItem}>
      <Link to={`/projects/${project.id}`}>
        <img src={project.image} alt={project.name} />
        <h3>{project.name}</h3>
        <ul>
          {project.tags.map((tag, index) => (
            <li key={index} style={{ '--color': tag.color }}>
              {tag.label}
            </li>
          ))}
        </ul>
      </Link>
    </div>
  );
};

export default ProjectItem;
