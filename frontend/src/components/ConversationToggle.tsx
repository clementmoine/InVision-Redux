import { forwardRef, useState, useEffect, useCallback } from 'react';
import Hotkeys from 'react-hot-keys';
import { cn } from '@/lib/utils';
import { MessageCircleOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

import { MessageCircleIcon } from '@/components/icons/message-circle';

interface ConversationToggleProps {
  className?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  count?: number;
  totalCount?: number;
  onCheckedChange?: (checked: boolean, showAll: boolean) => void; // Update to pass showAll state
}

const ConversationToggle = forwardRef<
  HTMLButtonElement,
  ConversationToggleProps
>((props, ref) => {
  const {
    count,
    totalCount,
    className = '',
    checked: controlledChecked,
    onCheckedChange,
    defaultChecked = true,
  } = props;

  const isControlled = 'checked' in props;

  const [isChecked, setIsChecked] = useState<boolean>(
    isControlled ? !controlledChecked : (defaultChecked ?? false),
  );
  const [isShiftPressed, setIsShiftPressed] = useState(false); // State to track Shift key

  // Handle toggling conversations
  const handleToggle = useCallback(() => {
    if (onCheckedChange) {
      onCheckedChange(!controlledChecked, isShiftPressed);
    } else {
      setIsChecked(prev => !prev);
    }
  }, [onCheckedChange, controlledChecked, isShiftPressed]);

  // Handle shift key press and release
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      setIsShiftPressed(true);
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      setIsShiftPressed(false);
    }
  }, []);

  // Listen for Shift key press
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const isCurrentlyChecked = isControlled ? controlledChecked : isChecked;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          ref={ref}
          size="icon"
          variant="ghost"
          data-state={isCurrentlyChecked ? 'checked' : 'unchecked'}
          className={cn('relative text-muted-foreground', className)}
          onClick={handleToggle}
        >
          <Hotkeys keyName="c" onKeyUp={handleToggle}>
            {count != null && count > 0 && (
              <Badge
                variant="default"
                className={cn(
                  'text-xs p-0 size-4 flex text-center align-middle justify-center absolute top-0 right-0',
                  { 'bg-muted-foreground/50': !isCurrentlyChecked },
                )}
              >
                {isShiftPressed && !isCurrentlyChecked
                  ? (totalCount ?? 0)
                  : (count ?? 0)}
              </Badge>
            )}

            {isCurrentlyChecked ? (
              <MessageCircleIcon className="size-5 shrink-0" />
            ) : (
              <MessageCircleOff className="size-5 shrink-0" />
            )}
          </Hotkeys>
        </Button>
      </TooltipTrigger>

      <TooltipContent side="top" sideOffset={5}>
        {isCurrentlyChecked
          ? 'Hide conversations'
          : isShiftPressed
            ? 'Show all conversations'
            : 'Show conversations'}{' '}
        <kbd>(C)</kbd>
      </TooltipContent>
    </Tooltip>
  );
});

ConversationToggle.displayName = 'ConversationToggle';

export default ConversationToggle;
