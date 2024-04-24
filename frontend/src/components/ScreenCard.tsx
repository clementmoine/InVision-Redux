import React from 'react';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { ImageOffIcon } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

import { ScreenForProject } from '@/types';

interface ScreenCardProps {
  screen: ScreenForProject;
}

const ScreenCard: React.FC<ScreenCardProps> = ({ screen }) => {
  return (
    <Card>
      <CardHeader className="p-0 border-b">
        <AspectRatio
          ratio={9 / 6}
          className="relative bg-white overflow-hidden rounded-md"
          style={{
            backgroundColor: screen.backgroundColor,
          }}
        >
          <Link to={`/projects/${screen.projectID}/${screen.id}/preview`}>
            {screen.thumbnailUrl ? (
              <img
                className="absolute inset-0 h-full w-full object-cover transition-all hover:scale-105"
                src={`/api/static/${screen.thumbnailUrl}`}
                alt={screen.name}
              />
            ) : (
              <ImageOffIcon className="h-8 w-8" />
            )}
          </Link>
        </AspectRatio>
      </CardHeader>

      <CardContent className="flex flex-col gap-1 justify-between py-4 px-6">
        <Link to={`/projects/${screen.projectID}/${screen.id}/preview`}>
          <CardTitle className="text-sm text-ellipsis whitespace-nowrap overflow-hidden">
            {screen.name}
          </CardTitle>
        </Link>

        <CardDescription>{dayjs(screen.updatedAt).fromNow()}</CardDescription>
      </CardContent>
    </Card>
  );
};
ScreenCard.displayName = 'ScreenCard';

export { ScreenCard };
