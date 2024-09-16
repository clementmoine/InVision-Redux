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
} from '@/types';

import dayjs from 'dayjs';
import { Card } from '@/components/ui/card';
import { IntermediateRepresentation } from 'linkifyjs';
import style from './Conversation.module.scss';
import { cn } from '@/lib/utils';

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
      //   flip({ fallbackAxisSideDirection: 'end' }),
      shift(),
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

  const referenceStyle = useMemo(() => {
    return {
      top: conversation.y * zoomLevel,
      left: conversation.x * zoomLevel,
    };
  }, [conversation, zoomLevel]);

  const firstComment = useMemo(
    () => [...conversation.comments].shift(),
    [conversation],
  );

  const renderLink = useCallback((options: IntermediateRepresentation) => {
    const { content, attributes } = options;
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
              'absolute size-8 z-[9999] -translate-y-full opacity-70 hover:opacity-100 transition-opacity',
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
            <img
              src={`/api/static/${firstComment?.avatarUrl}`}
              className="absolute rounded-full inset-0 border-4 border-current"
            />
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
              className="w-96 max-h-96 z-[9999] overflow-hidden overflow-y-scroll"
              {...getFloatingProps()}
            >
              <ol className="flex flex-col gap-4 p-0 m-0 overflow-hidden w-full justify-between py-4 px-6 select-text text-sm text-muted-foreground">
                {conversation.comments.map(comment => (
                  <li key={comment.id} className="flex gap-4 w-full">
                    <img
                      src={`/api/static/${comment.avatarUrl}`}
                      className={cn('size-6 rounded-full shrink-0', {
                        grayscale: conversation.isComplete,
                      })}
                    />

                    <div className="flex gap-1 flex-col w-full ">
                      <div className="flex justify-between  text-foreground">
                        <p className="text-md">{comment.userName}</p>
                        <p>{dayjs(comment.createdAt).fromNow()}</p>
                      </div>

                      <p
                        className="text-sm  w-full"
                        style={{
                          whiteSpace: 'pre-line',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        <Linkify options={{ render: renderLink }}>
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
