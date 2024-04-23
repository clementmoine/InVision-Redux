import { CSSProperties, HTMLProps, useMemo, useState } from 'react';
import {
  ExtendedRefs,
  ReferenceType,
  offset,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react';

import { eventTypes } from '@/constants/hotspots';

import { EventType } from '@/types';
import { useDoubleClick } from '@/hooks/useDoubleClick';
import { Button } from '@/components/ui/button';
import { useLongPress } from '@/hooks/useLongPress';
import { useSwipe } from '@/hooks/useSwipe';

export default function Test() {
  const [isOpen, setIsOpen] = useState<EventType | undefined>(undefined);

  // Hover
  const {
    context: hoverContext,
    refs: hoverRefs,
    floatingStyles: hoverFloatingStyles,
  } = useFloating({
    placement: 'top',
    middleware: [offset(8)],
    open: isOpen === 'hover',
    onOpenChange: (open: boolean) => {
      setIsOpen(previousOpen => {
        if (open) {
          return 'hover';
        } else if (previousOpen === 'hover' && !open) {
          return undefined;
        }
      });
    },
  });

  const {
    getFloatingProps: hoverGetFloatingProps,
    getReferenceProps: hoverGetReferenceProps,
  } = useInteractions([useHover(hoverContext)]);

  // Click
  const {
    context: clickContext,
    refs: clickRefs,
    floatingStyles: clickFloatingStyles,
  } = useFloating({
    placement: 'top',
    middleware: [offset(8)],
    open: isOpen === 'click',
    onOpenChange: (open: boolean) => {
      setIsOpen(previousOpen => {
        if (open) {
          return 'click';
        } else if (previousOpen === 'click' && !open) {
          return undefined;
        }
      });
    },
  });

  const {
    getFloatingProps: clickGetFloatingProps,
    getReferenceProps: clickGetReferenceProps,
  } = useInteractions([useClick(clickContext), useDismiss(clickContext)]);

  // Custom hooks
  // Double tap/click
  const {
    context: doubleClickContext,
    refs: doubleClickRefs,
    floatingStyles: doubleClickFloatingStyles,
  } = useFloating({
    placement: 'top',
    middleware: [offset(8)],
    open: isOpen === 'doubleTap',
    onOpenChange: (open: boolean) => {
      setIsOpen(previousOpen => {
        if (open) {
          return 'doubleTap';
        } else if (previousOpen === 'doubleTap' && !open) {
          return undefined;
        }
      });
    },
  });

  const {
    getFloatingProps: doubleClickGetFloatingProps,
    getReferenceProps: doubleClickGetReferenceProps,
  } = useInteractions([
    useDoubleClick(doubleClickContext),
    useDismiss(doubleClickContext),
  ]);

  // Long press
  const {
    context: pressHoldContext,
    refs: pressHoldRefs,
    floatingStyles: pressHoldFloatingStyles,
  } = useFloating({
    placement: 'top',
    middleware: [offset(8)],
    open: isOpen === 'pressHold',
    onOpenChange: (open: boolean) => {
      setIsOpen(previousOpen => {
        if (open) {
          return 'pressHold';
        } else if (previousOpen === 'pressHold' && !open) {
          return undefined;
        }
      });
    },
  });

  const {
    getFloatingProps: pressHoldGetFloatingProps,
    getReferenceProps: pressHoldGetReferenceProps,
  } = useInteractions([
    useLongPress(pressHoldContext),
    useDismiss(pressHoldContext),
  ]);

  // Swipe up
  const {
    context: swipeUpContext,
    refs: swipeUpRefs,
    floatingStyles: swipeUpFloatingStyles,
  } = useFloating({
    placement: 'top',
    middleware: [offset(8)],
    open: isOpen === 'swipeUp',
    onOpenChange: (open: boolean) => {
      setIsOpen(previousOpen => {
        if (open) {
          return 'swipeUp';
        } else if (previousOpen === 'swipeUp' && !open) {
          return undefined;
        }
      });
    },
  });

  const {
    getFloatingProps: swipeUpGetFloatingProps,
    getReferenceProps: swipeUpGetReferenceProps,
  } = useInteractions([
    useSwipe(swipeUpContext, { direction: 'up' }),
    useDismiss(swipeUpContext),
  ]);

  // Swipe right
  const {
    context: swipeRightContext,
    refs: swipeRightRefs,
    floatingStyles: swipeRightFloatingStyles,
  } = useFloating({
    placement: 'top',
    middleware: [offset(8)],
    open: isOpen === 'swipeRight',
    onOpenChange: (open: boolean) => {
      setIsOpen(previousOpen => {
        if (open) {
          return 'swipeRight';
        } else if (previousOpen === 'swipeRight' && !open) {
          return undefined;
        }
      });
    },
  });

  const {
    getFloatingProps: swipeRightGetFloatingProps,
    getReferenceProps: swipeRightGetReferenceProps,
  } = useInteractions([
    useSwipe(swipeRightContext, { direction: 'right' }),
    useDismiss(swipeRightContext),
  ]);

  // Swipe down
  const {
    context: swipeDownContext,
    refs: swipeDownRefs,
    floatingStyles: swipeDownFloatingStyles,
  } = useFloating({
    placement: 'top',
    middleware: [offset(8)],
    open: isOpen === 'swipeDown',
    onOpenChange: (open: boolean) => {
      setIsOpen(previousOpen => {
        if (open) {
          return 'swipeDown';
        } else if (previousOpen === 'swipeDown' && !open) {
          return undefined;
        }
      });
    },
  });

  const {
    getFloatingProps: swipeDownGetFloatingProps,
    getReferenceProps: swipeDownGetReferenceProps,
  } = useInteractions([
    useSwipe(swipeDownContext, { direction: 'down' }),
    useDismiss(swipeDownContext),
  ]);

  // Swipe left
  const {
    context: swipeLeftContext,
    refs: swipeLeftRefs,
    floatingStyles: swipeLeftFloatingStyles,
  } = useFloating({
    placement: 'top',
    middleware: [offset(8)],
    open: isOpen === 'swipeLeft',
    onOpenChange: (open: boolean) => {
      setIsOpen(previousOpen => {
        if (open) {
          return 'swipeLeft';
        } else if (previousOpen === 'swipeLeft' && !open) {
          return undefined;
        }
      });
    },
  });

  const {
    getFloatingProps: swipeLeftGetFloatingProps,
    getReferenceProps: swipeLeftGetReferenceProps,
  } = useInteractions([
    useSwipe(swipeLeftContext, { direction: 'left' }),
    useDismiss(swipeLeftContext),
  ]);

  // Common props dep
  const refs = useMemo<
    Record<EventType, ExtendedRefs<ReferenceType> | undefined>
  >(
    () => ({
      click: clickRefs,
      doubleTap: doubleClickRefs,
      pressHold: pressHoldRefs,
      swipeRight: swipeRightRefs,
      swipeLeft: swipeLeftRefs,
      swipeUp: swipeUpRefs,
      swipeDown: swipeDownRefs,
      hover: hoverRefs,
      timer: undefined,
    }),
    [
      clickRefs,
      doubleClickRefs,
      hoverRefs,
      pressHoldRefs,
      swipeRightRefs,
      swipeLeftRefs,
      swipeDownRefs,
      swipeUpRefs,
    ],
  );

  const getFloatingProps = useMemo<
    Record<
      EventType,
      | ((
          userProps?: HTMLProps<HTMLElement> | undefined,
        ) => Record<string, unknown>)
      | undefined
    >
  >(
    () => ({
      click: clickGetFloatingProps,
      doubleTap: doubleClickGetFloatingProps,
      pressHold: pressHoldGetFloatingProps,
      swipeRight: swipeRightGetFloatingProps,
      swipeLeft: swipeLeftGetFloatingProps,
      swipeUp: swipeUpGetFloatingProps,
      swipeDown: swipeDownGetFloatingProps,
      hover: hoverGetFloatingProps,
      timer: undefined,
    }),
    [
      clickGetFloatingProps,
      doubleClickGetFloatingProps,
      hoverGetFloatingProps,
      pressHoldGetFloatingProps,
      swipeUpGetFloatingProps,
      swipeRightGetFloatingProps,
      swipeLeftGetFloatingProps,
      swipeDownGetFloatingProps,
    ],
  );

  const getReferenceProps = useMemo<
    Record<
      EventType,
      | ((
          userProps?: HTMLProps<HTMLElement> | undefined,
        ) => Record<string, unknown>)
      | undefined
    >
  >(
    () => ({
      click: clickGetReferenceProps,
      doubleTap: doubleClickGetReferenceProps,
      pressHold: pressHoldGetReferenceProps,
      swipeRight: swipeRightGetReferenceProps,
      swipeLeft: swipeLeftGetReferenceProps,
      swipeUp: swipeUpGetReferenceProps,
      swipeDown: swipeDownGetReferenceProps,
      hover: hoverGetReferenceProps,
      timer: undefined,
    }),
    [
      clickGetReferenceProps,
      doubleClickGetReferenceProps,
      pressHoldGetReferenceProps,
      swipeRightGetReferenceProps,
      swipeLeftGetReferenceProps,
      swipeUpGetReferenceProps,
      swipeDownGetReferenceProps,
      hoverGetReferenceProps,
    ],
  );

  const floatingStyles = useMemo<Record<EventType, CSSProperties | undefined>>(
    () => ({
      click: clickFloatingStyles,
      doubleTap: doubleClickFloatingStyles,
      pressHold: pressHoldFloatingStyles,
      swipeRight: swipeRightFloatingStyles,
      swipeLeft: swipeLeftFloatingStyles,
      swipeUp: swipeUpFloatingStyles,
      swipeDown: swipeDownFloatingStyles,
      hover: hoverFloatingStyles,
      timer: undefined,
    }),
    [
      clickFloatingStyles,
      doubleClickFloatingStyles,
      pressHoldFloatingStyles,
      swipeUpFloatingStyles,
      swipeRightFloatingStyles,
      swipeLeftFloatingStyles,
      swipeDownFloatingStyles,
      hoverFloatingStyles,
    ],
  );

  return (
    <div className="flex flex-col p-16 gap-16">
      <h1>Playground to test floating UI + custom hooks</h1>

      <div
        dir="ltr"
        data-orientation="horizontal"
        className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
      >
        {(Object.keys(eventTypes) as EventType[]).map(eventType => {
          const eventString = eventType
            .replace(/([A-Z])/g, ' $1')
            .toLowerCase()
            .trim();

          if (eventType === 'timer') return null;

          return (
            <div key={eventType}>
              {isOpen === eventType && (
                <div
                  ref={refs[eventType]?.setFloating}
                  style={floatingStyles[eventType]}
                  className="z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md"
                  {...(getFloatingProps[eventType]?.() || {})}
                >
                  Congratulations you made a proper <b>{eventString}</b> event !
                  🎉
                </div>
              )}

              <Button
                className="text-sm w-full h-full text-ellipsis whitespace-nowrap overflow-hidden capitalize aspect-video"
                ref={refs[eventType]?.setReference}
                {...(getReferenceProps[eventType]?.() || {})}
              >
                {eventString}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
