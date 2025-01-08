import { MutableRefObject, Ref } from 'react';

/**
 * Merges multiple refs into a single ref callback.
 * @param refs - Refs to be merged.
 * @returns A callback ref that updates all provided refs.
 */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): Ref<T> {
  return (value: T | null) => {
    refs.forEach(ref => {
      if (!ref) return; // Skip if ref is undefined
      if (typeof ref === 'function') {
        ref(value); // Call the ref function with the value
      } else if ('current' in ref) {
        (ref as MutableRefObject<T | null>).current = value; // Update the current property of the ref object
      }
    });
  };
}
