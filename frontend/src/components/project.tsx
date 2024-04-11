import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { AspectRatio } from '@/components/ui/aspect-ratio';

import { useFavorites } from '@/hooks/useFavorites';
import { Project as ProjectType } from '@/types';

interface ProjectProps {
  project: ProjectType;
}

const Project: React.FC<ProjectProps> = ({ project }) => {
  const { favorites, setFavorites } = useFavorites();

  return (
    <Card>
      <CardHeader className="p-0 border-b">
        <AspectRatio
          ratio={9 / 6}
          className="relative bg-muted overflow-hidden rounded-md"
        >
          <Link to={`/projects/${project.id}`}>
            <img
              className="absolute inset-0 h-full w-full object-cover transition-all hover:scale-105"
              src={`/api/static${project.data.thumbnailUrl}`}
              alt={project.data.name}
            />
          </Link>

          <div className="absolute flex flex-col top-2 left-2 gap-1">
            {project.data.tags.map(tag => (
              <Link
                key={tag.id}
                to={`/projects?tag=${tag.id}`}
                className="flex"
              >
                <Badge className="w-fit border-popover bg-muted-foreground">
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        </AspectRatio>
      </CardHeader>

      <CardContent className="flex flex-row gap-4 px-4 py-3 justify-between">
        <div className="flex flex-col gap-1 overflow-hidden">
          <Link to={`/projects/${project.id}`}>
            <CardTitle className="text-md text-ellipsis whitespace-nowrap overflow-hidden">
              {project.data.name}
            </CardTitle>
          </Link>

          <CardDescription>{project.data.itemCount} screens</CardDescription>
        </div>

        <Toggle
          aria-label="Add to favorites"
          pressed={favorites.has(project.id)}
          onPressedChange={pressed => {
            setFavorites(favorites => {
              if (pressed) {
                favorites.add(project.id);
              } else {
                favorites.delete(project.id);
              }

              return favorites;
            });
          }}
        >
          <StarIcon
            fill={favorites.has(project.id) ? 'currentColor' : 'transparent'}
            className="h-4 w-4"
          />
        </Toggle>
      </CardContent>
    </Card>
  );
};
Project.displayName = 'Project';

export { Project };
