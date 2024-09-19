import React, { MouseEventHandler } from 'react';
import dayjs from 'dayjs';
import {
  Archive,
  ImageOffIcon,
  MessageCircle,
  MessageCircleDashed,
} from 'lucide-react';

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
  disabled?: boolean;
  className?: string;
  mode?: 'inspect' | 'preview';
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

const ScreenCard: React.FC<ScreenCardProps> = props => {
  const { mode = 'preview', screen, disabled, className, onClick } = props;

  return (
    <Card
      className={cn(
        'bg-background rounded-md overflow-hidden shadow-md',
        className,
      )}
    >
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
                : `/projects/${screen.projectID}/${screen.id}/${mode}`
            }
            onClick={onClick}
            className="flex h-full w-full items-center justify-center text-slate-500 aria-disabled:cursor-not-allowed"
          >
            {screen.thumbnailUrl ? (
              <img
                className={cn(
                  'absolute inset-0 h-auto w-full object-cover transition-all',
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
          onClick={onClick}
          className="aria-disabled:cursor-not-allowed"
        >
          <CardTitle className="flex items-center gap-1 text-sm">
            {screen.isArchived && (
              <Archive aria-label="Archived" className="h-4 w-4" />
            )}

            <span className="text-ellipsis whitespace-nowrap overflow-hidden">
              {screen.name}
            </span>
          </CardTitle>
        </a>

        <CardDescription title={dayjs(screen.updatedAt).format('L LT')}>
          {dayjs(screen.updatedAt).fromNow()}
        </CardDescription>

        <CardDescription className="flex items-center gap-1">
          {screen.conversationCount > 0 ? (
            <MessageCircle className="size-4" />
          ) : (
            <MessageCircleDashed className="size-4" />
          )}
          {screen.conversationCount} conversations
        </CardDescription>
      </CardContent>
    </Card>
  );
};
ScreenCard.displayName = 'ScreenCard';

export { ScreenCard };
