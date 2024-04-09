import React from 'react';
import { Link } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';

import { Project as ProjectType } from '@/types';

interface ProjectProps {
  project: ProjectType;
}

const Project: React.FC<ProjectProps> = ({ project }) => {
  return (
    <Card>
      <CardHeader>
        <AspectRatio ratio={16 / 9} className="bg-muted overflow-hidden">
          <Link to={`/projects/${project.id}`}>
            <img
              className="absolute rounded-md inset-0 transition-all hover:scale-105"
              src={`api/static${project.data.thumbnailUrl}`}
              alt={project.data.name}
            />
          </Link>

          <div className="absolute flex gap-1 flex-col mt-auto left-2 bottom-2">
            {project.data.tags.map(tag => (
              <Link key={tag.id} to={`?tag=${tag.id}`}>
                <Badge className="w-fit border-popover">{tag.name}</Badge>
              </Link>
            ))}
          </div>
        </AspectRatio>
      </CardHeader>
      <Link to={`/projects/${project.id}`}>
        <CardContent className="flex flex-col gap-1">
          <CardTitle className="text-md text-ellipsis whitespace-nowrap overflow-hidden">
            {project.data.name}
          </CardTitle>
          <CardDescription>{project.data.itemCount} screens</CardDescription>
        </CardContent>
      </Link>
    </Card>
  );
};
Project.displayName = 'Project';

export { Project };
