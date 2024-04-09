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
    <Link to={`/projects/${project.id}`}>
      <Card>
        <CardHeader>
          <AspectRatio ratio={16 / 9} className="bg-muted overflow-hidden">
            <img
              className="absolute rounded-md inset-0 transition-all hover:scale-105"
              src={`api/static${project.data.thumbnailUrl}`}
              alt={project.data.name}
            />

            <div className="absolute flex gap-1 flex-col mt-auto left-2 bottom-2">
              {project.data.tags.map(tag => (
                <Link to={`?tag=${tag.id}`}>
                  <Badge className="w-fit border-popover" key={tag.id}>
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </AspectRatio>
        </CardHeader>
        <CardContent>
          <CardTitle>{project.data.name}</CardTitle>
          <CardDescription>{project.data.itemCount} screens</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
};
Project.displayName = 'Project';

export { Project };
