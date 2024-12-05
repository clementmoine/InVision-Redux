import React from 'react';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { Archive, ImageOffIcon, StarIcon } from 'lucide-react';

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
import { getStaticUrl } from '@/utils';

interface ProjectCardProps {
  project: ProjectType;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { favorites, setFavorites } = useFavorites();

  return (
    <Card className="bg-background rounded-md overflow-hidden shadow-md">
      <CardHeader className="p-0 border-b">
        <AspectRatio
          ratio={9 / 6}
          className="relative bg-white overflow-hidden"
        >
          <Link
            to={`/projects/${project.id}`}
            className="flex h-full w-full items-center justify-center text-slate-500"
          >
            {project.data.thumbnailUrl ? (
              <img
                className="absolute inset-0 h-auto w-full object-cover transition-all hover:scale-105"
                src={getStaticUrl(project.data.thumbnailUrl)}
                alt={project.data.name}
              />
            ) : (
              <ImageOffIcon className="h-8 w-8" />
            )}
          </Link>

          <div className="absolute flex flex-col bottom-2 left-2 gap-1">
            {project.data.tags.map(tag => (
              <Link
                key={tag.id}
                to={`/projects?tag=${tag.id}`}
                className="flex"
              >
                <Badge
                  variant="secondary"
                  className="w-fit gap-1 border-current"
                >
                  <div
                    className="h-2 w-2 rounded"
                    style={{
                      backgroundColor: tag.color,
                    }}
                  />
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        </AspectRatio>
      </CardHeader>

      <CardContent className="flex flex-row gap-4 justify-between py-4 px-6">
        <div className="flex flex-col gap-1 overflow-hidden">
          <Link to={`/projects/${project.id}`}>
            <CardTitle className="flex items-center gap-1 text-sm">
              {project.data.isArchived && (
                <Archive aria-label="Archived" className="shrink-0 size-4" />
              )}

              <span className="text-ellipsis overflow-hidden break-words line-clamp-2">
                {project.data.name}
              </span>
            </CardTitle>
          </Link>

          <CardDescription>{project.data.itemCount} screens</CardDescription>

          <CardDescription title={dayjs(project.data.updatedAt).format('L LT')}>
            {dayjs(project.data.updatedAt).fromNow()}
          </CardDescription>
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
ProjectCard.displayName = 'ProjectCard';

export { ProjectCard };
