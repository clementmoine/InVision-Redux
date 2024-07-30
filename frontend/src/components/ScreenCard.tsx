import React from 'react';
import dayjs from 'dayjs';
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
import { cn } from '@/lib/utils';

interface ScreenCardProps {
  screen: ScreenForProject;
  disabled: boolean;
}

const ScreenCard: React.FC<ScreenCardProps> = ({ screen, disabled }) => {
  return (
    <Card className="bg-background rounded-md overflow-hidden shadow-md">
      <CardHeader className="p-0 border-b">
        <AspectRatio
          ratio={9 / 6}
          className="relative bg-white overflow-hidden"
          style={{
            backgroundColor: screen.backgroundColor,
          }}
        >
          <a
            aria-disabled={disabled}
            href={
              disabled
                ? undefined
                : `/projects/${screen.projectID}/${screen.id}/preview`
            }
            className="flex h-full w-full items-center justify-center text-slate-500 aria-disabled:cursor-not-allowed"
          >
            {screen.thumbnailUrl ? (
              <img
                className={cn(
                  'absolute inset-0 h-full w-full object-cover transition-all',
                  {
                    'hover:scale-105': !disabled,
                  },
                )}
                src={`/api/static/${screen.thumbnailUrl}`}
                alt={screen.name}
              />
            ) : (
              <ImageOffIcon className="h-8 w-8" />
            )}
          </a>
        </AspectRatio>
      </CardHeader>

      <CardContent className="flex flex-col gap-1 justify-between py-4 px-6">
        <a
          aria-disabled={disabled}
          href={
            disabled
              ? undefined
              : `/projects/${screen.projectID}/${screen.id}/preview`
          }
          className="aria-disabled:cursor-not-allowed"
        >
          <CardTitle className="text-sm text-ellipsis whitespace-nowrap overflow-hidden">
            {screen.name}
          </CardTitle>
        </a>

        <CardDescription>{dayjs(screen.updatedAt).fromNow()}</CardDescription>
      </CardContent>
    </Card>
  );
};
ScreenCard.displayName = 'ScreenCard';

export { ScreenCard };
