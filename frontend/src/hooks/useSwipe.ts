import {
  ElementProps,
  FloatingContext,
  ReferenceType,
} from '@floating-ui/react';
import { isMouseLikePointerType } from '@floating-ui/react/utils';
import { useMemo, useRef } from 'react';

export interface UseSwipeProps {
  /**
   * Whether the Hook is enabled, including all internal Effects and event
   * handlers.
   * @default true
   */
  enabled?: boolean;
  /**
   * Whether to toggle the open state with repeated clicks.
   * @default true
   */
  toggle?: boolean;
  /**
   * Whether to ignore the logic for mouse input (for example, if `useHover()`
   * is also being used).
   * When `useHover()` and `useClick()` are used together, clicking the
   * reference element after hovering it will keep the floating element open
   * even once the cursor leaves. This may be not be desirable in some cases.
   * @default false
   */
  ignoreMouse?: boolean;
  /**
   * Whether to add keyboard handlers (Enter and Space key functionality) for
   * non-button elements (to open/close the floating element via keyboard
   * “click”).
   * @default true
   */
  keyboardHandlers?: boolean;
  /**
   * The direction of the wanted swipe.
   * @default 'top'
   */
  direction?: SwipeDirection;
}

export type SwipeDirection = 'up' | 'right' | 'down' | 'left';

/**
 * Detects swipe on an element.
 */
export function useSwipe<RT extends ReferenceType = ReferenceType>(
  context: FloatingContext<RT>,
  props: UseSwipeProps = {},
): ElementProps {
  const { open, onOpenChange, dataRef } = context;

  const {
    enabled = true,
    toggle = true,
    ignoreMouse,
    keyboardHandlers = true,
    direction = 'top',
  } = props;

  const startCoordsRef = useRef<{ x: number; y: number } | null>(null);

  const didKeyDownRef = useRef<boolean>(false);

  const pointerTypeRef = useRef<'mouse' | 'pen' | 'touch'>();

  return useMemo(() => {
    if (!enabled) return {};

    return {
      reference: {
        onClick(event) {
          if (
            isMouseLikePointerType(pointerTypeRef.current, true) &&
            !ignoreMouse
          ) {
            if (
              open &&
              toggle &&
              (dataRef.current.openEvent
                ? dataRef.current.openEvent.type === 'click'
                : true)
            ) {
              onOpenChange(false, event.nativeEvent, 'click');
            } else {
              onOpenChange(true, event.nativeEvent, 'click');
            }
          }
        },
        onKeyDown(event) {
          if (
            event.defaultPrevented ||
            !keyboardHandlers ||
            didKeyDownRef.current
          )
            return;

          const key = event.key;
          if (
            ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(key)
          ) {
            event.preventDefault(); // Prevent scrolling

            const directionMap = {
              ArrowUp: 'up',
              ArrowRight: 'right',
              ArrowDown: 'down',
              ArrowLeft: 'left',
            };

            const swipeDirection =
              directionMap[
                key as 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'ArrowLeft'
              ];

            if (swipeDirection === direction) {
              // Trigger swipe action
              if (open && toggle) {
                onOpenChange(false, event.nativeEvent, 'click');
              } else {
                onOpenChange(true, event.nativeEvent, 'click');
              }

              didKeyDownRef.current = true;
            }
          }
        },
        onKeyUp() {
          if (!keyboardHandlers) {
            return;
          }

          didKeyDownRef.current = false;
        },
        onPointerDown(event) {
          pointerTypeRef.current = event.pointerType;
        },
        onTouchStart(event) {
          pointerTypeRef.current = 'touch';

          startCoordsRef.current = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          };
        },
        onTouchEnd(event) {
          if (!startCoordsRef.current) return;

          const endCoords = {
            x: event.changedTouches[0].clientX,
            y: event.changedTouches[0].clientY,
          };
          const deltaX = endCoords.x - startCoordsRef.current.x;
          const deltaY = endCoords.y - startCoordsRef.current.y;

          if (
            (direction === 'up' &&
              deltaY < 0 &&
              Math.abs(deltaY) > Math.abs(deltaX)) ||
            (direction === 'right' &&
              deltaX > 0 &&
              Math.abs(deltaX) > Math.abs(deltaY)) ||
            (direction === 'down' &&
              deltaY > 0 &&
              Math.abs(deltaY) > Math.abs(deltaX)) ||
            (direction === 'left' &&
              deltaX < 0 &&
              Math.abs(deltaX) > Math.abs(deltaY))
          ) {
            if (open && toggle) {
              onOpenChange(false, event.nativeEvent, 'click');
            } else {
              onOpenChange(true, event.nativeEvent, 'click');
            }
          }

          startCoordsRef.current = null;
        },
      },
    };
  }, [
    dataRef,
    direction,
    enabled,
    ignoreMouse,
    keyboardHandlers,
    onOpenChange,
    open,
    toggle,
  ]);
}
