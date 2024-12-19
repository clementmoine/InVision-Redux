import { useRef } from 'react';

export const useDragScroll = (isEnabled: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEnabled) return;

    if (!(e.target as HTMLElement).dataset.permit_scroll) return;

    isDragging.current = true;
    startY.current = e.clientY;
    scrollTop.current = containerRef.current?.scrollTop || 0;
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEnabled || !isDragging.current || !containerRef.current) return;

    const deltaY = e.clientY - startY.current;
    containerRef.current.scrollTop = scrollTop.current - deltaY;
  };

  const onMouseUp = () => {
    if (!isEnabled) return;
    isDragging.current = false;
  };

  return {
    containerRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  };
};
