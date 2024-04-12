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

import { Screen as ScreenType } from '@/types';

interface ScreenProps {
  screen: ScreenType;
}

const Screen: React.FC<ScreenProps> = ({ screen }) => {
  return (
    <Card>
      <CardHeader className="p-0 border-b">
        <AspectRatio
          ratio={9 / 6}
          className="relative bg-muted overflow-hidden rounded-md"
        >
          <Link to={`/projects/${screen.projectID}/${screen.id}`}>
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

      <CardContent className="flex flex-row gap-4 px-4 py-3 justify-between">
        <div className="flex flex-col gap-1 overflow-hidden">
          <Link to={`/projects/${screen.projectID}/${screen.id}`}>
            <CardTitle className="text-sm text-ellipsis whitespace-nowrap overflow-hidden">
              {screen.name}
            </CardTitle>
          </Link>

          <CardDescription>{dayjs(screen.updatedAt).fromNow()}</CardDescription>
        </div>
      </CardContent>
    </Card>
  );
};
Screen.displayName = 'Screen';

export { Screen };
