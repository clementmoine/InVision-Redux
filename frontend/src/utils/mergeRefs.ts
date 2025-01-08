import { MutableRefObject, Ref } from 'react';

export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): Ref<T> {
  return (value: T | null) => {
    refs.forEach(ref => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(value);
      } else if ('current' in ref) {
        (ref as MutableRefObject<T | null>).current = value;
      }
    });
  };
}
