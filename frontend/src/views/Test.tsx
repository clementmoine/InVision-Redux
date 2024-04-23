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

import { Card, CardContent, CardTitle } from '@/components/ui/card';

import { eventTypes } from '@/constants/hotspots';

import { EventType } from '@/types';

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

  const refs = useMemo<
    Record<EventType, ExtendedRefs<ReferenceType> | undefined>
  >(
    () => ({
      click: clickRefs,
      doubleTap: undefined,
      pressHold: undefined,
      swipeRight: undefined,
      swipeLeft: undefined,
      swipeUp: undefined,
      swipeDown: undefined,
      hover: hoverRefs,
      timer: undefined,
    }),
    [clickRefs, hoverRefs],
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
      doubleTap: undefined,
      pressHold: undefined,
      swipeRight: undefined,
      swipeLeft: undefined,
      swipeUp: undefined,
      swipeDown: undefined,
      hover: hoverGetFloatingProps,
      timer: undefined,
    }),
    [clickGetFloatingProps, hoverGetFloatingProps],
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
      doubleTap: undefined,
      pressHold: undefined,
      swipeRight: undefined,
      swipeLeft: undefined,
      swipeUp: undefined,
      swipeDown: undefined,
      hover: hoverGetReferenceProps,
      timer: undefined,
    }),
    [clickGetReferenceProps, hoverGetReferenceProps],
  );

  const floatingStyles = useMemo<Record<EventType, CSSProperties | undefined>>(
    () => ({
      click: clickFloatingStyles,
      doubleTap: undefined,
      pressHold: undefined,
      swipeRight: undefined,
      swipeLeft: undefined,
      swipeUp: undefined,
      swipeDown: undefined,
      hover: hoverFloatingStyles,
      timer: undefined,
    }),
    [clickFloatingStyles, hoverFloatingStyles],
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

          return (
            <>
              {isOpen === eventType && (
                <div
                  ref={refs[eventType]?.setFloating}
                  style={floatingStyles[eventType]}
                  className="z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md"
                  {...(getFloatingProps[eventType]?.() || {})}
                >
                  Congratulations you made a proper <b>{eventString}</b> event
                </div>
              )}

              <Card
                role="button"
                ref={refs[eventType]?.setReference}
                {...(getReferenceProps[eventType]?.() || {})}
              >
                <CardContent className="flex flex-col gap-1 justify-between py-4 px-6">
                  <CardTitle className="text-sm text-ellipsis whitespace-nowrap overflow-hidden capitalize">
                    {eventString}
                  </CardTitle>
                </CardContent>
              </Card>
            </>
          );
        })}
      </div>
    </div>
  );
}
