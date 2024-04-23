import {
  isMouseLikePointerType,
  isTypeableElement,
} from '@floating-ui/react/utils';
import { isHTMLElement } from '@floating-ui/utils/dom';
import {
  ElementProps,
  FloatingContext,
  ReferenceType,
} from '@floating-ui/react';
import { useMemo, useRef } from 'react';

function isButtonTarget(event: React.KeyboardEvent<Element>) {
  return isHTMLElement(event.target) && event.target.tagName === 'BUTTON';
}

function isSpaceIgnored(element: Element | null) {
  return isTypeableElement(element);
}

export interface UseDoubleClickProps {
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
   * “double click”).
   * @default true
   */
  keyboardHandlers?: boolean;
  /**
   * The maximum delay allowed between two clicks to consider them as a double click.
   * @default 300 milliseconds
   */
  delay?: number;
}

/**
 * Detects double clicks on an element.
 */
export function useDoubleClick<RT extends ReferenceType = ReferenceType>(
  context: FloatingContext<RT>,
  props: UseDoubleClickProps = {},
): ElementProps {
  const {
    open,
    onOpenChange,
    dataRef,
    elements: { domReference },
  } = context;

  const {
    enabled = true,
    toggle = true,
    ignoreMouse = false,
    keyboardHandlers = true,
    delay = 300,
  } = props;

  const lastClickTimeRef = useRef<number>(0);
  const didKeyDownRef = useRef(false);

  const pointerTypeRef = useRef<'mouse' | 'pen' | 'touch'>();

  return useMemo(() => {
    if (!enabled) return {};

    return {
      reference: {
        onPointerDown(event) {
          pointerTypeRef.current = event.pointerType;
        },
        onClick(event) {
          if (
            isMouseLikePointerType(pointerTypeRef.current, true) &&
            ignoreMouse
          ) {
            return;
          }

          const currentTime = Date.now();
          const elapsedTime = currentTime - lastClickTimeRef.current;

          if (elapsedTime <= delay) {
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

          lastClickTimeRef.current = currentTime;
        },
        onKeyDown(event) {
          pointerTypeRef.current = undefined;

          if (
            event.defaultPrevented ||
            !keyboardHandlers ||
            isButtonTarget(event) // Button already triggers the onClick
          ) {
            return;
          }

          if (event.key === ' ' && !isSpaceIgnored(domReference)) {
            // Prevent scrolling
            event.preventDefault();
            didKeyDownRef.current = true;
          }

          const currentTime = Date.now();
          const elapsedTime = currentTime - lastClickTimeRef.current;

          if (elapsedTime <= delay) {
            if (event.key === 'Enter') {
              if (open && toggle) {
                onOpenChange(false, event.nativeEvent, 'click');
              } else {
                onOpenChange(true, event.nativeEvent, 'click');
              }
            }
          }

          lastClickTimeRef.current = currentTime;
        },
        onKeyUp(event) {
          if (
            event.defaultPrevented ||
            !keyboardHandlers ||
            isButtonTarget(event) || // Button already triggers the onClick
            isSpaceIgnored(domReference)
          ) {
            return;
          }

          const currentTime = Date.now();
          const elapsedTime = currentTime - lastClickTimeRef.current;

          if (elapsedTime <= delay) {
            if (event.key === ' ' && didKeyDownRef.current) {
              didKeyDownRef.current = false;
              if (open && toggle) {
                onOpenChange(false, event.nativeEvent, 'click');
              } else {
                onOpenChange(true, event.nativeEvent, 'click');
              }
            }
          }
        },
      },
    };
  }, [
    dataRef,
    delay,
    domReference,
    enabled,
    ignoreMouse,
    keyboardHandlers,
    onOpenChange,
    open,
    toggle,
  ]);
}
