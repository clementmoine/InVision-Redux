import {
  useClick,
  useFloating,
  useInteractions,
  useDismiss,
  useRole,
  FloatingFocusManager,
  offset,
  shift,
  autoUpdate,
  FloatingPortal,
  flip,
} from '@floating-ui/react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Linkify from 'linkify-react';
import { useCallback, useMemo, useState } from 'react';

import {
  ArchivedScreenDetails,
  Conversation as ConversationType,
  Screen,
  Comment,
} from '@/types';

import dayjs from 'dayjs';
import { Card } from '@/components/ui/card';
import { IntermediateRepresentation } from 'linkifyjs';
import style from './Conversation.module.scss';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import 'linkify-plugin-mention';

interface ConversationProps {
  conversation: ConversationType;
  visible: boolean | 'all';
  zoomLevel: number;
  screen: Screen | ArchivedScreenDetails['screen'];
}

const Conversation: React.FC<ConversationProps> = props => {
  const { conversation, visible, zoomLevel } = props;

  const [isOpen, setIsOpen] = useState(false);

  // Handle open (for floating and trigger hotspot actions)
  const handleOpen = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  const { refs, context, floatingStyles } = useFloating({
    placement: 'right-start',
    open: isOpen,
    onOpenChange: handleOpen,
    middleware: [
      offset(10),
      shift({
        boundary: document.querySelector('#screen-container') || undefined,
      }),
      flip({
        fallbackPlacements: ['left-start'],
        boundary: document.querySelector('#screen-container') || undefined,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  function isSystemAvatar(avatarID: string | undefined): boolean {
    return avatarID !== undefined && avatarID.startsWith('00000000');
  }

  function getInitials(name: string | undefined): string {
    if (!name) return '';

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts.shift() || '';
    const lastName = nameParts.pop() || '';

    return (
      firstName.slice(0, 1).toUpperCase() + lastName.slice(0, 1).toUpperCase()
    );
  }

  const referenceStyle = useMemo(() => {
    return {
      top: conversation.y * zoomLevel,
      left: conversation.x * zoomLevel,
    };
  }, [conversation, zoomLevel]);

  const commenters = useMemo(() => {
    if (!conversation || !conversation.comments) return [];

    return conversation.comments.reduce(
      (users, comment) => {
        const userExists = users.some(user => user.userID === comment.userID);

        if (!userExists) {
          users.push({
            avatarID: comment.avatarID,
            avatarUrl: comment.avatarUrl,
            userName: comment.userName,
            userID: comment.userID,
          });
        }

        return users;
      },
      [] as Pick<Comment, 'avatarID' | 'userName' | 'avatarUrl' | 'userID'>[],
    );
  }, [conversation]);

  const isValidUrl = (url: string | undefined): boolean => {
    try {
      return !!url && !!new URL(url); // Tente de créer un objet URL pour valider
    } catch {
      return false;
    }
  };

  const renderLink = useCallback((options: IntermediateRepresentation) => {
    const { content, attributes } = options;
    const href = attributes?.href;

    if (isValidUrl(href)) {
      return (
        <a
          className="text-primary hover:text-primary"
          target="_blank"
          rel="noopener noreferrer"
          {...attributes}
        >
          {content}
        </a>
      );
    }

    return (
      <span className="text-blue-400" {...attributes}>
        {content}
      </span>
    );
  }, []);

  return (conversation.isComplete && visible !== 'all') || !visible ? null : (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            ref={refs.setReference}
            {...getReferenceProps()}
            style={referenceStyle}
            className={cn(
              'absolute h-8 min-w-8 z-[9998] -translate-y-full opacity-70 hover:opacity-100 transition-opacity',
              {
                'text-white': !conversation.isTourPoint,
                'text-blue-400': conversation.isTourPoint,
                'opacity-100': isOpen || conversation.isTourPoint,
                grayscale: conversation.isComplete,
                [style['ripple-effect']]: conversation.isTourPoint,
              },
            )}
          >
            {/* Bubble shape */}
            <div className="absolute inset-0 size-full shadow-md shadow-gray-500/50 rounded-e-full rounded-ss-full bg-current" />

            {/* Avatar */}
            <div className="-space-x-4 h-full flex m-auto">
              {commenters.map((commenter, index) => (
                <Avatar
                  key={commenter.avatarID}
                  className={cn(
                    'h-full aspect-square w-auto shrink-0 border-4 border-transparent',
                    {
                      grayscale: conversation.isComplete,
                    },
                  )}
                  style={{ zIndex: commenters.length - index }}
                >
                  <AvatarImage
                    src={
                      isSystemAvatar(commenter.avatarID)
                        ? undefined
                        : `/api/static/${commenter.avatarUrl}`
                    }
                    alt={commenter.userName}
                  />
                  <AvatarFallback className="text-muted-foreground text-[12px] align-middle text-center h-full aspect-square w-auto p-0">
                    {getInitials(commenter.userName)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </button>
        </TooltipTrigger>

        <TooltipContent side="left" className="dark" sideOffset={5}>
          {isOpen ? 'Close' : 'Open'} conversation
        </TooltipContent>
      </Tooltip>

      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <Card
              ref={refs.setFloating}
              style={floatingStyles}
              className="w-96 max-h-96 z-[9998] overflow-hidden overflow-y-scroll"
              {...getFloatingProps()}
            >
              <ol className="flex flex-col gap-4 p-0 m-0 overflow-hidden w-full justify-between py-4 px-6 select-text text-sm text-muted-foreground">
                {conversation.comments.map(comment => (
                  <li key={comment.id} className="flex gap-2 w-full">
                    {/* Avatar */}
                    <Avatar
                      className={cn('size-6 shrink-0', {
                        grayscale: conversation.isComplete,
                      })}
                    >
                      <AvatarImage
                        src={
                          isSystemAvatar(comment.avatarID)
                            ? undefined
                            : `/api/static/${comment.avatarUrl}`
                        }
                        alt={comment.userName}
                      />

                      <AvatarFallback className="text-muted-foreground text-[12px] align-middle text-center h-full aspect-square w-auto p-0">
                        {getInitials(comment.userName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex gap-2 flex-col w-full ">
                      <div className="flex gap-2 text-foreground">
                        <p>{comment.userName}</p>

                        {/* Comment date */}
                        <p
                          className="text-muted-foreground"
                          title={dayjs(comment.createdAt).format('L LT')}
                        >
                          {dayjs(comment.createdAt).fromNow()}
                        </p>
                      </div>

                      <p
                        className="text-sm w-full"
                        style={{
                          whiteSpace: 'pre-line',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        <Linkify
                          options={{
                            render: renderLink,
                          }}
                        >
                          {comment.comment}
                        </Linkify>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
};

export default Conversation;
