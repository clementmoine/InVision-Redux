import { isTypeableElement } from '@floating-ui/react/utils';
import {
  ElementProps,
  FloatingContext,
  ReferenceType,
} from '@floating-ui/react';
import { useMemo, useRef } from 'react';

function isSpaceIgnored(element: Element | null) {
  return isTypeableElement(element);
}

export interface UseLongPressProps {
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
   * “long click”).
   * @default true
   */
  keyboardHandlers?: boolean;
  /**
   * The duration for the click/tap/key to consider them as a long press.
   * @default 500 milliseconds
   */
  duration?: number;
}

/**
 * Detects long click on an element.
 */
export function useLongPress<RT extends ReferenceType = ReferenceType>(
  context: FloatingContext<RT>,
  props: UseLongPressProps = {},
): ElementProps {
  const {
    open,
    onOpenChange,
    elements: { domReference },
  } = context;

  const {
    enabled = true,
    toggle = true,
    keyboardHandlers = true,
    duration = 500,
  } = props;

  const timerRef = useRef<number | undefined>(undefined);
  const didKeyDownRef = useRef<boolean>(false);

  const pointerTypeRef = useRef<'mouse' | 'pen' | 'touch'>();

  return useMemo(() => {
    if (!enabled) return {};

    return {
      reference: {
        onContextMenu: event => {
          if (pointerTypeRef.current !== 'mouse') event.preventDefault();
        },
        onPointerDown(event) {
          event.preventDefault();

          pointerTypeRef.current = event.pointerType;

          timerRef.current = window.setTimeout(() => {
            if (open && toggle) {
              onOpenChange(false, event.nativeEvent, 'click');
            } else {
              onOpenChange(true, event.nativeEvent, 'click');
            }
          }, duration);
        },
        onPointerUp() {
          clearTimeout(timerRef.current);
          timerRef.current = undefined;
        },
        onPointerLeave() {
          clearTimeout(timerRef.current);
          timerRef.current = undefined;
        },
        onKeyDown(event) {
          if (
            event.defaultPrevented ||
            !keyboardHandlers ||
            didKeyDownRef.current
          ) {
            return;
          }

          if (event.key === ' ' && !isSpaceIgnored(domReference)) {
            // Prevent scrolling
            event.preventDefault();
          }

          if (['Enter', ' '].includes(event.key)) {
            timerRef.current = window.setTimeout(() => {
              if (open && toggle) {
                onOpenChange(false, event.nativeEvent, 'click');
              } else {
                onOpenChange(true, event.nativeEvent, 'click');
              }
            }, duration);

            didKeyDownRef.current = true;
          }
        },
        onKeyUp() {
          if (!keyboardHandlers) {
            return;
          }

          clearTimeout(timerRef.current);
          timerRef.current = undefined;
          didKeyDownRef.current = false;
        },
      },
    };
  }, [
    domReference,
    duration,
    enabled,
    keyboardHandlers,
    onOpenChange,
    open,
    toggle,
  ]);
}
